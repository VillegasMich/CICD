## Context

The CI/CD pipeline is a single `ci_cd.yml` file. The backend Docker image is currently built and pushed to ECR in one job (`be-build-and-push-ecr`) that only runs on push to `develop`/`main`. There is no security scanning anywhere in the pipeline today.

Trivy is a free, open-source scanner by Aqua Security. No account, API key, or external service is needed. The GitHub Action (`aquasecurity/trivy-action`) wraps the Trivy CLI.

## Goals / Non-Goals

**Goals:**
- On PRs: scan Python/npm dependencies, secrets, and Dockerfile misconfigs; report findings without blocking merge
- On push to develop/main: build image → scan tar → push to ECR only if scan passes; block on CRITICAL or HIGH CVEs
- Surface all findings in the GitHub Security tab via SARIF

**Non-Goals:**
- Building or scanning the Docker image on PRs
- Terraform IaC scanning
- Blocking on MEDIUM/LOW findings
- Trivy database caching between runs

## Decisions

### 1. Image scan only on push, not on PRs

Image build is expensive and requires AWS credentials (ECR). PRs get the cheaper, faster `trivy-fs-scan` instead. The image scan gate on push to develop/main is sufficient: if a dependency has a CVE it will be caught either in the FS scan (on the PR) or the image scan (on merge).

```
pull_request                     push to develop / main
─────────────                    ──────────────────────
trivy-fs-scan                    be-build-and-push-ecr
  scan-type: fs                    build → /tmp/bicycle-app.tar
  scan-ref: .                      trivy scan tar
  scanners: vuln,secret,           → exit-code 1 on CRITICAL,HIGH
            misconfig              → if passes: push to ECR
  exit-code: 0 (warn only)
```

### 2. Option B: build → tar → scan → push (within one job)

Build the image with `push: false` and `load: true` to load it into the local Docker daemon, export to `/tmp/bicycle-app.tar`, scan the tar, then push to ECR — all within the existing `be-build-and-push-ecr` job. No job split needed.

```
be-build-and-push-ecr (push events only)

  docker/build-push-action
    push: false, load: true
    tags: <ecr-uri>:${{ github.sha }}
         │
         ▼
  docker save → /tmp/bicycle-app.tar
         │
         ▼
  aquasecurity/trivy-action
    scan-type: image
    input: /tmp/bicycle-app.tar
    severity: CRITICAL,HIGH
    ignore-unfixed: true
    exit-code: '1'
    format: sarif
         │ FAIL → job stops, push step never runs
         ▼ PASS
  docker/build-push-action
    push: true
    tags: <ecr-uri>:${{ github.sha }} [+ :stable on main]
```

This avoids inter-job artifact passing (Docker tars are 200–400 MB) and keeps the existing job structure intact.

### 3. FS scan on PRs only, exit-code 0

`trivy-fs-scan` runs only on `pull_request` events. It scans the whole repo with `scanners: vuln,secret,misconfig`:
- `vuln` → CVEs in `backend/requirements.txt` and `frontend/package.json`
- `secret` → hardcoded credentials, tokens, keys in source files
- `misconfig` → Dockerfile best-practice violations

Exit code is `0` — findings are reported but do not block the PR. Dependency CVEs often have no available fix; blocking PRs on unfixed vulns would stall development. SARIF upload to the Security tab provides visibility without friction.

### 4. SARIF upload with `if: always()`

Both jobs upload SARIF via `github/codeql-action/upload-sarif@v3` with `if: always()`. Without `always()`, a Trivy exit-code 1 failure skips the upload step and findings are lost. The `security-events: write` permission is required on each job.

### 5. Severity threshold: CRITICAL,HIGH for image scan; CRITICAL,HIGH,MEDIUM for FS scan

Image scan blocks on CRITICAL and HIGH only. OS-level CVEs in base images at MEDIUM are frequently unfixed noise.
FS scan reports CRITICAL, HIGH, and MEDIUM (exit-code 0) for broader visibility — developers can triage before merge.

### 6. `ignore-unfixed: true` on image scan only

OS-level CVEs in base images commonly have no upstream fix. Without this flag, a standard `python:3.12-slim` may fail even when nothing can be done. FS scan does NOT use `ignore-unfixed` so unfixed dep CVEs are still visible on PRs.

## Pipeline Flow (after change)

```
on: pull_request
  ┌── be-lint-and-unit-tests
  ├── fe-test-and-build
  └── trivy-fs-scan                  ← NEW
       permissions: security-events: write
       scan-type: fs, scan-ref: .
       scanners: vuln,secret,misconfig
       severity: CRITICAL,HIGH,MEDIUM
       exit-code: 0
       upload SARIF → GitHub Security tab

on: push → develop / main
  ┌── be-lint-and-unit-tests
  ├── fe-test-and-build
  ├── provision-shared-infra
  └── be-build-and-push-ecr          ← MODIFIED (same job, new steps)
       permissions: security-events: write
       needs: [be-lint-and-unit-tests, provision-shared-infra]
       steps:
         build (push:false, load:true)
         docker save → /tmp/bicycle-app.tar
         trivy scan tar (exit-code:1 on CRITICAL,HIGH)  ← NEW
         upload SARIF                                    ← NEW
         push to ECR (only if scan passes)
              │
              ▼
       deploy-staging (unchanged)
              │
              ▼
       deploy-production (unchanged)
```

## Files Changed

| File | Change |
|------|--------|
| `.github/workflows/ci_cd.yml` | Add `trivy-fs-scan` job; add tar export + scan + SARIF upload steps to `be-build-and-push-ecr`; add `permissions: security-events: write` to both jobs |

## External Requirements

None. Trivy is fully open-source. No account registration, no API key, no paid plan. The `aquasecurity/trivy-action` GitHub Action downloads the Trivy binary at runtime. The only GitHub-side requirement is `security-events: write` permission, available by default on all repos via `GITHUB_TOKEN`.

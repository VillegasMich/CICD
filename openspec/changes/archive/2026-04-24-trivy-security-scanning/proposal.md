## Why

The pipeline currently ships Docker images and deploys infrastructure with no automated security checks. Vulnerabilities in Python/npm dependencies, OS packages in the container image, and secrets accidentally committed can reach production undetected. Adding Trivy closes these gaps without requiring external accounts or paid tooling.

## What Changes

- Add `trivy-fs-scan` job that runs on PRs only, scanning `backend/requirements.txt`, `frontend/package.json`, and the `backend/Dockerfile` for dependency CVEs, secrets, and misconfigurations. Findings are reported but do not block the PR.
- Extend `be-build-and-push-ecr` (push to develop/main only) to build the image into a local tar, scan that tar with Trivy, and only push to ECR if no CRITICAL or HIGH CVEs are found.
- Upload SARIF results from both jobs to the GitHub Security tab for centralized visibility.

## Capabilities

### New Capabilities
- `security-scanning`: Trivy-based vulnerability scanning for container images (scan-before-push on develop/main) and source dependencies (on PRs), integrated into the existing CI/CD pipeline

### Modified Capabilities
- `aws-infra-backend`: `be-build-and-push-ecr` gains a scan step between build and push; ECR push only proceeds if scan passes

## Impact

- **CI**: `ci_cd.yml` gains one new job (`trivy-fs-scan`) and `be-build-and-push-ecr` gains two new steps (tar export + trivy scan)
- **Permissions**: Jobs that upload SARIF require `security-events: write`
- **No application code changes**
- **No new secrets or credentials required** — Trivy is fully open-source with no account or API key

## Non-goals

- Terraform / IaC misconfiguration scanning
- License compliance scanning
- Blocking deploys on MEDIUM or LOW severity findings
- Trivy server mode or DB caching between runs

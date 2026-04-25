## 1. Add `trivy-fs-scan` job (PR scan)

- [ ] 1.1 Add `trivy-fs-scan` job to `.github/workflows/ci_cd.yml` with `if: github.event_name == 'pull_request'`, `runs-on: ubuntu-latest`, `permissions: security-events: write`, and `uses: actions/checkout@v4`
- [ ] 1.2 Add `aquasecurity/trivy-action` step with `scan-type: fs`, `scan-ref: .`, `scanners: vuln,secret,misconfig`, `severity: CRITICAL,HIGH,MEDIUM`, `exit-code: '0'`, `format: sarif`, `output: trivy-fs-results.sarif`
- [ ] 1.3 Add `github/codeql-action/upload-sarif@v3` step with `if: always()` to upload `trivy-fs-results.sarif` to the GitHub Security tab

## 2. Extend `be-build-and-push-ecr` with scan-before-push

- [ ] 2.1 Add `permissions: security-events: write` to the `be-build-and-push-ecr` job in `.github/workflows/ci_cd.yml`
- [ ] 2.2 Change the existing `docker/build-push-action` step to `push: false` and add `load: true` so the image is loaded into the local Docker daemon without pushing to ECR; keep the same tags
- [ ] 2.3 Add a step after the build to export the image to a tar: `docker save <ecr-uri>:${{ github.sha }} -o /tmp/bicycle-app.tar`
- [ ] 2.4 Add `aquasecurity/trivy-action` step scanning the tar: `scan-type: image`, `input: /tmp/bicycle-app.tar`, `severity: CRITICAL,HIGH`, `exit-code: '1'`, `ignore-unfixed: true`, `format: sarif`, `output: trivy-image-results.sarif`
- [ ] 2.5 Add `github/codeql-action/upload-sarif@v3` step with `if: always()` to upload `trivy-image-results.sarif`
- [ ] 2.6 Add a second `docker/build-push-action` step (or `docker push`) after the scan with `push: true` and the same tags; this step only runs if the scan step passed (default GitHub Actions behavior — step is skipped if a prior step fails)

## 3. Verify pipeline integrity

- [ ] 3.1 Open a test PR to `develop` and confirm `trivy-fs-scan` runs and `be-build-and-push-ecr` does NOT run; confirm SARIF appears in the GitHub Security tab
- [ ] 3.2 Merge to `develop` and confirm `be-build-and-push-ecr` runs in order: build → tar → scan → push; confirm `deploy-staging` runs after
- [ ] 3.3 Check the GitHub Security tab (repo → Security → Code scanning) to confirm SARIF results appear from both scan jobs

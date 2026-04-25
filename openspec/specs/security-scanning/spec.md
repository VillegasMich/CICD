# Spec: Security Scanning

## Purpose

Defines automated vulnerability scanning requirements for the CI/CD pipeline using Trivy. Covers container image scanning (pre-push) and source dependency scanning (on pull requests).

## Requirements

### Requirement: Container image scanned before ECR push
The pipeline SHALL build the Docker image, scan it for vulnerabilities, and only push to ECR if no CRITICAL or HIGH severity CVEs are found.

#### Scenario: Image with CRITICAL CVE blocks push
- **WHEN** `be-build-and-scan` builds an image containing a CRITICAL CVE
- **THEN** the Trivy scan step SHALL exit with code 1 and `be-push-to-ecr` SHALL NOT run

#### Scenario: Image with no CRITICAL or HIGH CVEs proceeds to push
- **WHEN** `be-build-and-scan` builds an image with no CRITICAL or HIGH CVEs
- **THEN** the scan step SHALL exit with code 0 and `be-push-to-ecr` SHALL run normally

#### Scenario: Unfixed CVEs do not block the pipeline
- **WHEN** a CVE exists in the image but has no available fix from the upstream package maintainer
- **THEN** the scan SHALL skip that CVE (`ignore-unfixed: true`) and not count it toward the exit code

### Requirement: Image scan runs only on push to develop/main, not on PRs
The Docker image is built and scanned only when pushing to `develop` or `main`. PRs receive only the filesystem scan.

#### Scenario: PR does not trigger image build or scan
- **WHEN** a pull request is opened or updated
- **THEN** `be-build-and-push-ecr` SHALL NOT run; only `trivy-fs-scan` SHALL run

#### Scenario: Push to develop triggers image scan before ECR push
- **WHEN** a commit is pushed to `develop`
- **THEN** `be-build-and-push-ecr` SHALL build the image, scan the tar, and only push to ECR if the scan passes; `deploy-staging` SHALL follow

### Requirement: Source dependency scan on pull requests
The pipeline SHALL scan Python and npm dependencies, and the Dockerfile, for CVEs and secrets on every pull request.

#### Scenario: Dependency scan reports findings without blocking merge
- **WHEN** `trivy-fs-scan` detects a vulnerability in `requirements.txt` or `package.json`
- **THEN** the step SHALL exit with code 0 (findings are reported, PR is not blocked)

#### Scenario: Secret found in source code is reported
- **WHEN** `trivy-fs-scan` detects a hardcoded credential, token, or API key in the source tree
- **THEN** the finding SHALL appear in the SARIF upload to the GitHub Security tab

### Requirement: Scan results visible in GitHub Security tab
Both the image scan and the FS scan SHALL upload results in SARIF format to the GitHub Security tab.

#### Scenario: SARIF uploaded even when findings exist
- **WHEN** Trivy finds vulnerabilities (which would cause exit-code 1)
- **THEN** the `upload-sarif` step SHALL still run (`if: always()`) so findings are not lost

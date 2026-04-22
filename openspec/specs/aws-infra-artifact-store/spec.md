# Spec: AWS Infrastructure — Artifact Store

## Purpose

Defines the shared S3 artifact bucket for frontend builds, prefix-based versioning strategy, lifecycle cleanup, and CI promotion flow.

## Requirements

### Requirement: Shared S3 artifact bucket for frontend builds
The infrastructure SHALL provision one S3 bucket named `bicycle-frontend-artifacts-{account_id}` (suffix ensures global uniqueness) for storing versioned frontend builds. This bucket is shared across environments and deployed once via `shared/`.

#### Scenario: Artifact bucket exists after shared apply
- **WHEN** `terraform apply shared/` is run
- **THEN** the artifact bucket SHALL exist in `us-east-1` with versioning disabled (prefix-based versioning used instead)

### Requirement: Prefix-based versioning for frontend artifacts
CI SHALL upload built frontend assets to two prefixes on every successful build:
- `/v{GIT_SHA}/` — immutable, identifies the exact commit
- `/stable/` — overwritten on each build, represents the current promotable artifact

#### Scenario: Immutable version prefix is uploaded
- **WHEN** CI runs `npm run build` and uploads artifacts
- **THEN** all files in `dist/` SHALL exist at `s3://artifact-bucket/v{GIT_SHA}/`

#### Scenario: Stable prefix is updated
- **WHEN** CI uploads artifacts for a new commit
- **THEN** all files in `dist/` SHALL be synced to `s3://artifact-bucket/stable/`, replacing prior content

#### Scenario: Old version prefixes remain accessible
- **WHEN** a new version is uploaded to `/stable/`
- **THEN** previous `v{sha}/` prefixes SHALL remain in the bucket (not deleted)

### Requirement: Lifecycle rule for old version cleanup
The artifact bucket SHALL have an S3 lifecycle rule that expires objects under `v*/` prefixes older than 30 days.

#### Scenario: Old version prefixes are cleaned up automatically
- **WHEN** an object at `v{sha}/index.html` is older than 30 days
- **THEN** S3 SHALL automatically delete it without CI intervention

### Requirement: CI promotion flow from artifact bucket to environment bucket
CI SHALL promote frontend assets from the artifact bucket's versioned prefix to an environment's S3 static website bucket using `aws s3 sync`.

#### Scenario: Staging bucket is populated from versioned prefix
- **WHEN** the CD pipeline runs the staging deploy step
- **THEN** `aws s3 sync s3://artifact-bucket/v{sha}/ s3://staging-frontend-bucket/` SHALL execute and all files SHALL be present in the staging bucket

#### Scenario: Production bucket is populated after tests pass
- **WHEN** acceptance tests pass against staging
- **THEN** `aws s3 sync s3://artifact-bucket/v{sha}/ s3://production-frontend-bucket/` SHALL execute

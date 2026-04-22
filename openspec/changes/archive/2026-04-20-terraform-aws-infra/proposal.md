## Why

The app runs locally via docker-compose but has no cloud infrastructure. To enable automated CI/CD deployment to AWS, we need reproducible, version-controlled infrastructure for both staging and production environments.

## What Changes

- Add Terraform modules for ECS Fargate backend (staging + production), each fronted by an ALB
- Add Terraform modules for RDS PostgreSQL (staging + production), replacing docker-compose for cloud envs
- Add Terraform modules for S3-based frontend delivery: one artifact bucket (versioned prefixes) and two static website buckets (staging, production)
- Add shared Terraform state backend (S3 + DynamoDB)
- Separate Alembic migration job from app startup — migrations run as a one-off ECS task before each deployment
- Frontend API URL becomes runtime-injectable via `window.ENV_API_URL` from a `config.js` served alongside static assets
- Remove `alembic upgrade head` from `entrypoint.sh` (startup migrations replaced by explicit migration task)

## Capabilities

### New Capabilities

- `aws-infra-backend`: ECS Fargate service + ALB + security groups for the FastAPI backend, parameterized per environment
- `aws-infra-database`: RDS PostgreSQL instance per environment (staging, production) with subnet group and security group
- `aws-infra-frontend`: S3 static website hosting per environment (staging, production) with public-read policy
- `aws-infra-artifact-store`: Versioned S3 artifact bucket for frontend builds (`/v{sha}/` and `/stable/` prefixes)
- `aws-infra-migrations`: One-off ECS Fargate task that runs `alembic upgrade head` against the target environment DB before service update
- `terraform-module-structure`: Modular Terraform layout (`modules/`, `envs/staging`, `envs/production`, `shared/`)

### Modified Capabilities

- `database-setup`: Cloud environments now use RDS PostgreSQL injected via `DATABASE_URL` env var; local docker-compose unchanged

## Impact

- **`backend/entrypoint.sh`**: Remove `alembic upgrade head` line
- **`frontend/`**: Add `public/config.js` template read by app at runtime; `vite.config.js` proxy stays for local dev only
- **New `infra/` directory**: All Terraform code lives here
- **GitHub Actions secrets needed**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `LAB_ROLE_ARN`, `TF_STATE_BUCKET`, `TF_LOCK_TABLE`, `DB_PASSWORD_STAGING`, `DB_PASSWORD_PRODUCTION`, `JWT_SECRET`
- **No changes to API contracts, domain models, or business logic**

## Non-goals

- HTTPS / TLS termination (no ACM certs in AWS Academy LabRole scope)
- Custom domain names
- CloudFront CDN
- Multi-AZ RDS (cost)
- Autoscaling policies beyond minimum 1 task

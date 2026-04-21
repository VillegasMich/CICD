## 1. Bootstrap & Prerequisites

- [ ] 1.1 Manually create S3 state bucket and DynamoDB lock table for staging via AWS CLI (one-time bootstrap)
- [ ] 1.2 Manually create S3 state bucket and DynamoDB lock table for production via AWS CLI (one-time bootstrap)
- [ ] 1.3 Add GitHub Actions secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `LAB_ROLE_ARN`, `VPC_ID`, `SUBNET_IDS`, `TF_STATE_BUCKET_STAGING`, `TF_STATE_BUCKET_PROD`, `TF_LOCK_TABLE_STAGING`, `TF_LOCK_TABLE_PROD`, `DB_PASSWORD_STAGING`, `DB_PASSWORD_PROD`, `JWT_SECRET`
- [x] 1.4 Add `infra/` and `**/.terraform/` and `*.tfstate*` to `.gitignore`

## 2. Terraform Module: s3-artifact

- [x] 2.1 Create `infra/modules/s3-artifact/main.tf` with S3 bucket resource, versioning disabled, lifecycle rule expiring `v*/` objects after 30 days
- [x] 2.2 Create `infra/modules/s3-artifact/variables.tf` with `bucket_name_suffix` (account ID)
- [x] 2.3 Create `infra/modules/s3-artifact/outputs.tf` with `bucket_name`
- [x] 2.4 Create `infra/shared/main.tf` calling the `s3-artifact` module with S3 backend config
- [x] 2.5 Create `infra/shared/variables.tf` and `infra/shared/outputs.tf`

## 3. Terraform Module: s3-frontend

- [x] 3.1 Create `infra/modules/s3-frontend/main.tf` with S3 bucket, static website hosting (`index.html` for both index and error document), public-read bucket policy
- [x] 3.2 Create `infra/modules/s3-frontend/variables.tf` with `environment`, `bucket_name`
- [x] 3.3 Create `infra/modules/s3-frontend/outputs.tf` with `bucket_name`, `website_endpoint`

## 4. Terraform Module: rds

- [x] 4.1 Create `infra/modules/rds/main.tf` with `aws_db_instance` (postgres 16, `db.t3.micro`, single-AZ, no multi-AZ), `aws_db_subnet_group`, `aws_security_group` (inbound 5432 from ECS SG only)
- [x] 4.2 Create `infra/modules/rds/variables.tf` with `environment`, `db_name`, `db_username`, `db_password` (sensitive), `vpc_id`, `subnet_ids`, `ecs_sg_id`
- [x] 4.3 Create `infra/modules/rds/outputs.tf` with `db_endpoint`, `db_name`, `db_username`

## 5. Terraform Module: ecs-backend

- [x] 5.1 Create `infra/modules/ecs-backend/main.tf` with `aws_cloudwatch_log_group`, `aws_ecs_cluster`, security groups (ALB + ECS), `aws_lb`, `aws_lb_target_group` (health check on `/health`), `aws_lb_listener` (port 80 → 8000)
- [x] 5.2 Add `aws_ecs_task_definition` for app (Fargate, 256 CPU / 512 MB, env vars: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) and `aws_ecs_task_definition` for migration (same image, command override `["alembic", "upgrade", "head"]`)
- [x] 5.3 Add `aws_ecs_service` (desired_count=1, min_healthy=100, max_percent=200, load balancer attachment)
- [x] 5.4 Create `infra/modules/ecs-backend/variables.tf` with all needed inputs including `docker_image_uri`, `lab_role_arn`, `database_url`, `jwt_secret`, `environment`, `vpc_id`, `subnet_ids`
- [x] 5.5 Create `infra/modules/ecs-backend/outputs.tf` with `alb_dns_name`, `ecs_cluster_name`, `ecs_service_name`, `migration_task_definition_arn`, `ecs_sg_id`

## 6. Environment Roots

- [x] 6.1 Create `infra/envs/staging/main.tf` calling `rds`, `ecs-backend`, `s3-frontend` modules with staging-specific values; configure S3 backend with staging state bucket/key
- [x] 6.2 Create `infra/envs/staging/variables.tf` and `infra/envs/staging/outputs.tf` (output `alb_dns_name`, `frontend_website_endpoint`)
- [x] 6.3 Create `infra/envs/production/main.tf` (same structure as staging but production values)
- [x] 6.4 Create `infra/envs/production/variables.tf` and `infra/envs/production/outputs.tf`

## 7. App Code Changes

- [x] 7.1 Remove `alembic upgrade head` from `backend/entrypoint.sh`; add local-only migration back in `docker-compose.yml` using a `command` override or separate `migrate` service
- [x] 7.2 Add `<script src="/config.js"></script>` to `frontend/index.html` in `<head>` before the Vite bundle entry
- [x] 7.3 Update `frontend/src/api/client.js` to use `(window.ENV_API_URL || "") + "/api/v1"` as the base URL

## 8. CI/CD Pipeline: Backend Deploy

- [x] 8.1 Add CD GitHub Actions workflow (`.github/workflows/cd.yml`) triggered on push to `main`
- [x] 8.2 Add step: configure AWS credentials from GitHub Secrets
- [x] 8.3 Add step: `terraform init` + `terraform apply` for `shared/` (artifact bucket, idempotent)
- [x] 8.4 Add staging deploy job: `terraform init -backend-config=...` + `terraform apply envs/staging/` → capture `alb_dns_name`
- [x] 8.5 Add migration step: `aws ecs run-task` using `migration_task_definition_arn` output → poll for task exit 0
- [x] 8.6 Add backend deploy step: `aws ecs update-service --force-new-deployment` → `aws ecs wait services-stable`
- [x] 8.7 Add production deploy job (depends on staging tests passing): same steps 8.4-8.6 but for production

## 9. CI/CD Pipeline: Frontend Deploy

- [x] 9.1 Add frontend build step in CD workflow: `npm ci && npm run build` in `frontend/`
- [x] 9.2 Add step: upload `dist/` to artifact bucket under `v${GITHUB_SHA}/` and `stable/` prefixes
- [x] 9.3 Add staging frontend deploy step: generate `config.js` with staging ALB URL, sync `stable/` + `config.js` to staging S3 bucket (set `Cache-Control: no-store` on `config.js`)
- [x] 9.4 Add production frontend deploy step (after smoke tests pass): generate `config.js` with production ALB URL, sync `stable/` + `config.js` to production S3 bucket

## 10. Infrastructure README

- [x] 10.1 Create `infra/README.md` with prerequisites section (Terraform ≥1.6, AWS CLI configured, `aws sts get-caller-identity` check)
- [x] 10.2 Document one-time bootstrap steps: create S3 state bucket + DynamoDB lock table via AWS CLI commands (copy-paste ready)
- [x] 10.3 Document `shared/` apply: commands to deploy artifact bucket
- [x] 10.4 Document staging deploy: `terraform init -backend-config=...` + `terraform apply` with all required `-var` flags, expected outputs (ALB URL, S3 website URL)
- [x] 10.5 Document production deploy: same as staging section but for production
- [x] 10.6 Document destroy procedure: `terraform destroy` for each env in order (production → staging → shared), with warning about data loss
- [x] 10.7 Add GitHub Secrets reference table listing every secret name, what it maps to, and where to find the value (AWS console path or CLI command)

## 11. Validation

- [ ] 11.1 Run `terraform validate` and `terraform plan` locally for `shared/`, `envs/staging/`, `envs/production/` before first pipeline run
- [ ] 11.2 Manually run `terraform apply shared/` to create artifact bucket
- [ ] 11.3 Manually run `terraform apply envs/staging/` and verify ALB URL returns `{"status": "ok"}` from `/health`
- [ ] 11.4 Verify frontend loads at staging S3 website URL and API calls reach staging ALB
- [ ] 11.5 Run full CD pipeline end-to-end and verify both environments deploy successfully
- [ ] 11.6 Run `terraform destroy envs/staging/` and `envs/production/` after validation to preserve AWS Academy budget

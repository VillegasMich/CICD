## ADDED Requirements

### Requirement: Modular Terraform directory layout
The repository SHALL contain an `infra/` directory at the root with the following structure:

```
infra/
├── modules/
│   ├── ecs-backend/     # ALB + ECS cluster + task def (app + migration) + service + security groups
│   ├── rds/             # RDS instance + subnet group + security group
│   ├── s3-frontend/     # S3 static website bucket + public policy
│   └── s3-artifact/     # S3 artifact bucket + lifecycle rule
├── envs/
│   ├── staging/         # Terraform root for staging (calls modules)
│   └── production/      # Terraform root for production (calls modules)
└── shared/              # Terraform root for shared resources (artifact bucket)
```

#### Scenario: Staging and production are independent Terraform roots
- **WHEN** `terraform apply envs/staging/` is run
- **THEN** only staging resources SHALL be created or modified, with no effect on production state

#### Scenario: Shared artifact bucket is independent root
- **WHEN** `terraform apply shared/` is run
- **THEN** only the artifact bucket SHALL be created or modified

### Requirement: S3 + DynamoDB remote state backend
Each Terraform root (`envs/staging/`, `envs/production/`, `shared/`) SHALL use an S3 backend with DynamoDB state locking. Backend configuration SHALL be injected at CI time via `-backend-config` flags to avoid hardcoding bucket names.

#### Scenario: State is stored remotely
- **WHEN** any `terraform apply` completes
- **THEN** the `terraform.tfstate` file SHALL be stored in the configured S3 bucket, not locally

#### Scenario: Concurrent applies are prevented
- **WHEN** two CI jobs run `terraform apply` for the same environment simultaneously
- **THEN** the DynamoDB lock SHALL cause the second job to wait or fail with a lock error

### Requirement: Each module exposes required outputs
Every module SHALL output the values needed by parent roots and by CI:

- `ecs-backend`: `alb_dns_name`, `ecs_cluster_name`, `ecs_service_name`, `migration_task_definition_arn`
- `rds`: `db_endpoint`, `db_name`
- `s3-frontend`: `bucket_name`, `website_endpoint`
- `s3-artifact`: `bucket_name`

#### Scenario: ALB DNS name is available after apply
- **WHEN** `terraform output alb_dns_name` is run after apply
- **THEN** it SHALL return the DNS name of the environment's ALB

### Requirement: Environment variables and secrets passed via Terraform variables
Sensitive values (DB password, JWT secret) SHALL be declared as `sensitive = true` Terraform variables and injected by CI via environment variables (`TF_VAR_*`) rather than committed to `.tfvars` files.

#### Scenario: Secrets are not committed to repository
- **WHEN** the `infra/` directory is committed to Git
- **THEN** no `.tfvars` file SHALL contain real credentials

#### Scenario: CI injects secrets via environment variables
- **WHEN** GitHub Actions runs `terraform apply`
- **THEN** `TF_VAR_db_password` and `TF_VAR_jwt_secret` SHALL be set from GitHub Secrets

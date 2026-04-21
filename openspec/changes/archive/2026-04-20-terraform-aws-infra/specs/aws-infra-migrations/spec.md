## ADDED Requirements

### Requirement: Alembic migration as one-off ECS task
The infrastructure SHALL define an ECS task definition named `bicycle-{environment}-migration` that runs the same Docker image as the app service but overrides the command to execute `alembic upgrade head` only.

#### Scenario: Migration task definition exists
- **WHEN** `terraform apply` runs for an environment
- **THEN** a task definition `bicycle-{environment}-migration` SHALL exist with `command: ["alembic", "upgrade", "head"]`

#### Scenario: Migration task uses same DATABASE_URL as app
- **WHEN** the migration ECS task starts
- **THEN** it SHALL receive the same `DATABASE_URL` environment variable as the app service task

### Requirement: CI runs migration before service update
The CI/CD pipeline SHALL run the migration task via `aws ecs run-task` and wait for successful exit before triggering `aws ecs update-service`.

#### Scenario: Migration succeeds before deployment
- **WHEN** CI calls `aws ecs run-task` for the migration task
- **THEN** CI SHALL poll task status and only proceed when exit code is `0`

#### Scenario: Migration failure blocks deployment
- **WHEN** the migration ECS task exits with a non-zero code
- **THEN** the CI pipeline SHALL fail the current job and NOT call `aws ecs update-service`

### Requirement: entrypoint.sh does not run migrations
`backend/entrypoint.sh` SHALL NOT contain `alembic upgrade head`. The app SHALL start with `uvicorn` directly without performing any migration.

#### Scenario: App container starts without migration
- **WHEN** the Fargate app task starts
- **THEN** it SHALL execute `uvicorn main:app --host 0.0.0.0 --port 8000` directly, with no Alembic calls

### Requirement: Migration task shares network config with app service
The migration ECS task SHALL be launched in the same VPC subnets and security group as the app service, so it can reach the RDS instance.

#### Scenario: Migration task connects to RDS
- **WHEN** the migration task runs `alembic upgrade head`
- **THEN** the connection to RDS SHALL succeed because the ECS security group is allowed by the RDS security group

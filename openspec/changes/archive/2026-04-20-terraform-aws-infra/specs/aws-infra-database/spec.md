## ADDED Requirements

### Requirement: RDS PostgreSQL instance per environment
The infrastructure SHALL provision one `db.t3.micro` RDS PostgreSQL 16 instance for staging and one for production in `us-east-1`. Each instance SHALL be isolated with its own credentials.

#### Scenario: RDS instance is reachable from ECS tasks
- **WHEN** a Fargate task connects to `DATABASE_URL` using asyncpg
- **THEN** the connection SHALL succeed without timeout

#### Scenario: RDS instance is not reachable from the public internet
- **WHEN** a connection attempt is made to the RDS port (5432) from outside the ECS security group
- **THEN** the security group SHALL drop the connection

### Requirement: RDS security group allows only ECS task access
An RDS security group SHALL be created per environment that permits inbound PostgreSQL (port 5432) traffic only from the ECS task security group.

#### Scenario: ECS task connects to RDS
- **WHEN** the Fargate container opens a connection to RDS port 5432
- **THEN** the RDS security group SHALL allow the connection

### Requirement: RDS subnet group
Each RDS instance SHALL be associated with a DB subnet group that spans at least two Availability Zones using the default VPC's public subnets.

#### Scenario: RDS subnet group uses two AZs
- **WHEN** `terraform apply` provisions the RDS instance
- **THEN** the DB subnet group SHALL reference subnets in at least two AZs

### Requirement: DATABASE_URL injected into ECS task
The `DATABASE_URL` for the environment-specific RDS instance SHALL be constructed by Terraform and passed to the ECS task definition as an environment variable.

Format: `postgresql+asyncpg://{user}:{password}@{rds_endpoint}:5432/{db_name}`

#### Scenario: Backend connects to correct RDS per environment
- **WHEN** a staging ECS task starts
- **THEN** `DATABASE_URL` SHALL point to the staging RDS instance, not production

### Requirement: RDS credentials stored as Terraform sensitive variables
The RDS master password SHALL be passed to Terraform via a `sensitive = true` variable and never output in plaintext.

#### Scenario: DB password is not logged by Terraform
- **WHEN** `terraform apply` or `terraform output` is run
- **THEN** the RDS password value SHALL be redacted as `(sensitive value)` in all output

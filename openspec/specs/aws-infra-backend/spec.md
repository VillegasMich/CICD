# Spec: AWS Infrastructure — Backend

## Purpose

Defines ECS Fargate cluster, task definitions, service, ALB, security groups, and CloudWatch logging for the backend per environment.

## Requirements

### Requirement: ECS Fargate cluster per environment
The infrastructure SHALL provision an ECS cluster for each environment (`staging`, `production`) in `us-east-1`.

#### Scenario: Cluster exists after terraform apply
- **WHEN** `terraform apply` is run for an environment
- **THEN** an ECS cluster named `bicycle-{environment}-cluster` SHALL exist in `us-east-1`

### Requirement: ECS Fargate task definition
Each environment SHALL have an ECS task definition running the FastAPI backend Docker image on Fargate with `256 CPU` and `512 MB` memory.

#### Scenario: Task definition references correct image
- **WHEN** the ECS service launches a task
- **THEN** the container SHALL use the Docker image URI passed via `var.docker_image_uri`

#### Scenario: Task definition injects required environment variables
- **WHEN** a Fargate task starts
- **THEN** the container SHALL receive `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` as environment variables

#### Scenario: Task definition uses LabRole
- **WHEN** ECS pulls the image and writes CloudWatch logs
- **THEN** it SHALL use the `LabRole` ARN for both `taskRoleArn` and `executionRoleArn`

### Requirement: ECS Fargate service with rolling deployment
Each environment SHALL have an ECS service with `desired_count=1`, `minimum_healthy_percent=100`, and `maximum_percent=200` to enable zero-downtime rolling updates.

#### Scenario: New deployment starts new task before stopping old
- **WHEN** `aws ecs update-service --force-new-deployment` is called
- **THEN** ECS SHALL start a new task, wait for it to pass health checks, then stop the old task

#### Scenario: Service recovers from failed task
- **WHEN** a Fargate task exits unexpectedly
- **THEN** ECS SHALL automatically launch a replacement task

### Requirement: Application Load Balancer
Each environment SHALL have an internet-facing ALB that forwards HTTP port 80 traffic to port 8000 on the Fargate tasks.

#### Scenario: ALB forwards traffic to healthy tasks
- **WHEN** an HTTP request hits the ALB DNS name on port 80
- **THEN** it SHALL be forwarded to a running Fargate task on port 8000

#### Scenario: ALB health check passes for healthy app
- **WHEN** the ALB health check polls `GET /health` on port 8000
- **THEN** a `200 OK` response SHALL mark the target as healthy

#### Scenario: ALB removes unhealthy targets
- **WHEN** a Fargate task fails to return `200` from `/health` twice consecutively
- **THEN** the ALB SHALL stop routing traffic to that target

### Requirement: Security groups for ALB and ECS tasks
The ALB security group SHALL allow inbound HTTP (port 80) from `0.0.0.0/0`. The ECS task security group SHALL allow inbound traffic only on port 8000 from the ALB security group.

#### Scenario: Direct access to task port is blocked
- **WHEN** a request reaches port 8000 on the Fargate task from outside the ALB security group
- **THEN** the security group SHALL drop the connection

### Requirement: CloudWatch log group per environment
Each environment SHALL have a CloudWatch log group `/ecs/bicycle-{environment}-task` with 7-day retention for Fargate container logs.

#### Scenario: Container logs are available in CloudWatch
- **WHEN** the FastAPI application writes to stdout/stderr
- **THEN** logs SHALL appear in the CloudWatch log group within seconds

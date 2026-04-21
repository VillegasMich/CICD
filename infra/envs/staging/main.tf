terraform {
  required_version = ">= 1.6.0"

  backend "s3" {}

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  environment = "staging"
}

# --- Security Groups (created here to break module circular dependency) ---

resource "aws_security_group" "alb" {
  name        = "alb-sg-${local.environment}"
  description = "Allow HTTP from internet to ALB"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP from internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Environment = local.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_security_group" "ecs_tasks" {
  name        = "ecs-tasks-sg-${local.environment}"
  description = "Allow traffic from ALB to ECS tasks on port 8000"
  vpc_id      = var.vpc_id

  ingress {
    description     = "App port from ALB"
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Environment = local.environment
    ManagedBy   = "terraform"
  }
}

# --- RDS ---

module "rds" {
  source = "../../modules/rds"

  environment = local.environment
  db_name     = "bicycle_db"
  db_username = "bicycle_user"
  db_password = var.db_password
  vpc_id      = var.vpc_id
  subnet_ids  = var.subnet_ids
  ecs_sg_id   = aws_security_group.ecs_tasks.id
}

# --- ECS Backend ---

module "ecs_backend" {
  source = "../../modules/ecs-backend"

  environment      = local.environment
  docker_image_uri = var.docker_image_uri
  lab_role_arn     = var.lab_role_arn
  database_url     = "postgresql+asyncpg://bicycle_user:${var.db_password}@${module.rds.db_endpoint}:5432/bicycle_db"
  jwt_secret       = var.jwt_secret
  vpc_id           = var.vpc_id
  subnet_ids       = var.subnet_ids
  alb_sg_id        = aws_security_group.alb.id
  ecs_sg_id        = aws_security_group.ecs_tasks.id
  aws_region       = var.aws_region
}

# --- Frontend S3 ---

module "frontend" {
  source = "../../modules/s3-frontend"

  environment = local.environment
  bucket_name = "bicycle-frontend-${local.environment}-${var.account_id}"
}

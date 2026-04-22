variable "environment" {
  description = "Environment name (staging or production)."
  type        = string
}

variable "docker_image_uri" {
  description = "Full Docker image URI to deploy (e.g. user/bicycle-app:sha)."
  type        = string
}

variable "lab_role_arn" {
  description = "ARN of the existing LabRole IAM role used for ECS task execution."
  type        = string
}

variable "database_url" {
  description = "Full DATABASE_URL for asyncpg connection to RDS."
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret key for JWT token signing."
  type        = string
  sensitive   = true
}

variable "admin_email" {
  description = "Email for the auto-created admin user."
  type        = string
  default     = "admin@example.com"
}

variable "admin_password" {
  description = "Password for the auto-created admin user."
  type        = string
  sensitive   = true
  default     = "admin1234"
}

variable "vpc_id" {
  description = "VPC ID where resources are deployed."
  type        = string
}

variable "subnet_ids" {
  description = "Public subnet IDs for the ALB and Fargate tasks (must be in at least 2 AZs)."
  type        = list(string)
}

variable "alb_sg_id" {
  description = "Security group ID for the Application Load Balancer."
  type        = string
}

variable "ecs_sg_id" {
  description = "Security group ID for ECS Fargate tasks."
  type        = string
}

variable "aws_region" {
  description = "AWS region for CloudWatch log configuration."
  type        = string
  default     = "us-east-1"
}

variable "cors_origins" {
  description = "Comma-separated list of allowed CORS origins (e.g. the frontend S3 website URL)."
  type        = string
  default     = ""
}

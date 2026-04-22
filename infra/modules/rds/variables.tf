variable "environment" {
  description = "Environment name (staging or production)."
  type        = string
}

variable "db_name" {
  description = "PostgreSQL database name."
  type        = string
  default     = "bicycle_db"
}

variable "db_username" {
  description = "PostgreSQL master username."
  type        = string
  default     = "bicycle_user"
}

variable "db_password" {
  description = "PostgreSQL master password."
  type        = string
  sensitive   = true
}

variable "vpc_id" {
  description = "VPC ID where RDS will be deployed."
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the DB subnet group (must span at least 2 AZs)."
  type        = list(string)
}

variable "ecs_sg_id" {
  description = "Security group ID of ECS tasks allowed to connect to RDS."
  type        = string
}

variable "aws_region" {
  description = "AWS region."
  type        = string
  default     = "us-east-1"
}

variable "vpc_id" {
  description = "Default VPC ID."
  type        = string
}

variable "subnet_ids" {
  description = "List of public subnet IDs in at least 2 AZs from the default VPC."
  type        = list(string)
}

variable "lab_role_arn" {
  description = "ARN of the existing LabRole IAM role."
  type        = string
}

variable "docker_image_uri" {
  description = "Full Docker image URI to deploy (e.g. user/bicycle-app:sha)."
  type        = string
}

variable "db_password" {
  description = "RDS master password for production."
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret for production."
  type        = string
  sensitive   = true
}

variable "account_id" {
  description = "AWS account ID used to generate unique S3 bucket names."
  type        = string
}

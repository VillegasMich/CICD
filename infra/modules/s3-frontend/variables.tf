variable "environment" {
  description = "Environment name (staging or production)."
  type        = string
}

variable "bucket_name" {
  description = "Globally unique S3 bucket name for the frontend website."
  type        = string
}

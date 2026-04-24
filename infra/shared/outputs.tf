output "artifact_bucket_name" {
  description = "Name of the shared frontend artifact bucket."
  value       = module.artifact_store.bucket_name
}

output "ecr_repository_url" {
  description = "ECR repository URL (without tag) for the backend Docker image."
  value       = aws_ecr_repository.app.repository_url
}

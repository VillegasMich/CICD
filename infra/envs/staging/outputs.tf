output "alb_dns_name" {
  description = "Staging ALB DNS name — use as backend base URL."
  value       = module.ecs_backend.alb_dns_name
}

output "frontend_website_endpoint" {
  description = "Staging S3 static website URL."
  value       = module.frontend.website_endpoint
}

output "frontend_bucket_name" {
  description = "Staging frontend S3 bucket name."
  value       = module.frontend.bucket_name
}

output "ecs_cluster_name" {
  description = "ECS cluster name for CLI commands."
  value       = module.ecs_backend.ecs_cluster_name
}

output "ecs_service_name" {
  description = "ECS service name for CLI commands."
  value       = module.ecs_backend.ecs_service_name
}

output "migration_task_definition_arn" {
  description = "Migration ECS task definition ARN for CI run-task."
  value       = module.ecs_backend.migration_task_definition_arn
}

output "ecs_sg_id" {
  description = "ECS tasks security group ID (needed for run-task network config)."
  value       = aws_security_group.ecs_tasks.id
}

output "subnet_ids" {
  description = "Subnet IDs used by ECS tasks (needed for run-task network config)."
  value       = var.subnet_ids
}

output "db_endpoint" {
  description = "RDS instance hostname (without port)."
  value       = aws_db_instance.postgres.address
}

output "db_name" {
  description = "PostgreSQL database name."
  value       = aws_db_instance.postgres.db_name
}

output "db_username" {
  description = "PostgreSQL master username."
  value       = aws_db_instance.postgres.username
}

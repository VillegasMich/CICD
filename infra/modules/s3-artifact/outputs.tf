output "bucket_name" {
  description = "Name of the frontend artifact S3 bucket."
  value       = aws_s3_bucket.artifacts.bucket
}

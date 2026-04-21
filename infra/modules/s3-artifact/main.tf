resource "aws_s3_bucket" "artifacts" {
  bucket = "bicycle-frontend-artifacts-${var.account_id}"

  tags = {
    Name      = "bicycle-frontend-artifacts"
    ManagedBy = "terraform"
  }
}

resource "aws_s3_bucket_ownership_controls" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  rule {
    id     = "expire-version-prefixes"
    status = "Enabled"

    filter {
      prefix = "v"
    }

    expiration {
      days = 30
    }
  }
}

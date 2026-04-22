resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/bicycle-${var.environment}-task"
  retention_in_days = 7

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_ecs_cluster" "main" {
  name = "bicycle-${var.environment}-cluster"

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_lb" "main" {
  name                       = "bicycle-${var.environment}-alb"
  internal                   = false
  load_balancer_type         = "application"
  security_groups            = [var.alb_sg_id]
  subnets                    = var.subnet_ids
  enable_deletion_protection = false

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_lb_target_group" "app" {
  name        = "tg-${var.environment}"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/api/v1/health"
    port                = "8000"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    interval            = 15
    timeout             = 5
    matcher             = "200"
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = "bicycle-${var.environment}-app"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  task_role_arn            = var.lab_role_arn
  execution_role_arn       = var.lab_role_arn

  container_definitions = jsonencode([
    {
      name  = "bicycle-${var.environment}-app"
      image = var.docker_image_uri

      portMappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "DATABASE_URL", value = var.database_url },
        { name = "JWT_SECRET", value = var.jwt_secret },
        { name = "ADMIN_EMAIL", value = var.admin_email },
        { name = "ADMIN_PASSWORD", value = var.admin_password },
        { name = "CORS_ORIGINS", value = var.cors_origins },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "app"
        }
      }

      essential = true
    }
  ])

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_ecs_task_definition" "migration" {
  family                   = "bicycle-${var.environment}-migration"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  task_role_arn            = var.lab_role_arn
  execution_role_arn       = var.lab_role_arn

  container_definitions = jsonencode([
    {
      name       = "bicycle-${var.environment}-migration"
      image      = var.docker_image_uri
      entryPoint = ["alembic", "upgrade", "head"]

      environment = [
        { name = "DATABASE_URL", value = var.database_url },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "migration"
        }
      }

      essential = true
    }
  ])

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_ecs_service" "app" {
  name            = "bicycle-${var.environment}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [var.ecs_sg_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "bicycle-${var.environment}-app"
    container_port   = 8000
  }

  depends_on = [aws_lb_listener.http]

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

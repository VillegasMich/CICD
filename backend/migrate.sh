#!/bin/bash

# Migration helper script for dockerized environment

case "$1" in
  create)
    if [ -z "$2" ]; then
      echo "Usage: ./migrate.sh create <migration_message>"
      exit 1
    fi
    docker-compose exec app alembic revision --autogenerate -m "$2"
    ;;
  upgrade)
    docker-compose exec app alembic upgrade head
    ;;
  downgrade)
    docker-compose exec app alembic downgrade -1
    ;;
  history)
    docker-compose exec app alembic history
    ;;
  current)
    docker-compose exec app alembic current
    ;;
  upgrade-test)
    # Apply migrations to the postgres-test service (used by pytest).
    # Start test DB first: docker compose up -d postgres-test
    docker-compose exec -e DATABASE_URL="postgresql://postgres:postgres@postgres-test:5432/code_analyst_portal_test" app alembic upgrade head
    ;;
  *)
    echo "Usage: ./migrate.sh {create|upgrade|downgrade|history|current|upgrade-test}"
    echo ""
    echo "Commands:"
    echo "  create <message>  - Generate a new migration"
    echo "  upgrade          - Apply all pending migrations"
    echo "  downgrade        - Rollback the last migration"
    echo "  history          - Show migration history"
    echo "  current          - Show current migration version"
    echo "  upgrade-test     - Apply migrations to the test DB (code_analyst_portal_test)"
    exit 1
    ;;
esac

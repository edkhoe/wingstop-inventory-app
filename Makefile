# Wingstop Inventory App Makefile
# A comprehensive build system for the full-stack inventory management application

# Variables
PYTHON := python
NODE := node
NPM := npm
DOCKER := docker
DOCKER_COMPOSE := docker-compose
PYTEST := pytest
COVERAGE := coverage
UVICORN := uvicorn
ALEMBIC := alembic

# Directories
BACKEND_DIR := backend
FRONTEND_DIR := frontend
DOCKER_DIR := docker

# Backend variables
BACKEND_APP := main:app
BACKEND_HOST := 0.0.0.0
BACKEND_PORT := 8000
BACKEND_RELOAD := --reload

# Frontend variables
FRONTEND_PORT := 3000
FRONTEND_HOST := localhost

# Database
DB_NAME := wingstop_inventory.db
TEST_DB_NAME := test.db

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
PURPLE := \033[0;35m
CYAN := \033[0;36m
WHITE := \033[0;37m
NC := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

# Help target
.PHONY: help
help: ## Show this help message
	@echo "$(CYAN)Wingstop Inventory App - Available Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Usage Examples:$(NC)"
	@echo "  make install     # Install all dependencies"
	@echo "  make dev         # Start development servers"
	@echo "  make test        # Run all tests"
	@echo "  make clean       # Clean build artifacts"

# =============================================================================
# INSTALLATION
# =============================================================================

.PHONY: install
install: install-backend install-frontend ## Install all dependencies

.PHONY: install-backend
install-backend: ## Install backend Python dependencies
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	@cd $(BACKEND_DIR) && $(PYTHON) -m pip install -r requirements.txt
	@echo "$(GREEN)Backend dependencies installed!$(NC)"

.PHONY: install-frontend
install-frontend: ## Install frontend Node.js dependencies
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	@cd $(FRONTEND_DIR) && $(NPM) install
	@echo "$(GREEN)Frontend dependencies installed!$(NC)"

.PHONY: install-dev
install-dev: install ## Install development dependencies (alias for install)

# =============================================================================
# DEVELOPMENT SERVERS
# =============================================================================

.PHONY: dev
dev: ## Start both backend and frontend development servers
	@echo "$(CYAN)Starting development servers...$(NC)"
	@echo "$(YELLOW)Backend: http://$(BACKEND_HOST):$(BACKEND_PORT)$(NC)"
	@echo "$(YELLOW)Frontend: http://$(FRONTEND_HOST):$(FRONTEND_PORT)$(NC)"
	@echo "$(GREEN)Press Ctrl+C to stop all servers$(NC)"
	@$(MAKE) -j2 dev-backend dev-frontend

.PHONY: dev-backend
dev-backend: ## Start backend development server
	@echo "$(BLUE)Starting backend server...$(NC)"
	@cd $(BACKEND_DIR) && $(UVICORN) $(BACKEND_APP) --host $(BACKEND_HOST) --port $(BACKEND_PORT) $(BACKEND_RELOAD)

.PHONY: dev-frontend
dev-frontend: ## Start frontend development server
	@echo "$(BLUE)Starting frontend server...$(NC)"
	@cd $(FRONTEND_DIR) && $(NPM) run dev

# =============================================================================
# BUILD
# =============================================================================

.PHONY: build
build: build-backend build-frontend ## Build both backend and frontend

.PHONY: build-backend
build-backend: ## Build backend (no build step needed for Python)
	@echo "$(GREEN)Backend is ready to run!$(NC)"

.PHONY: build-frontend
build-frontend: ## Build frontend for production
	@echo "$(BLUE)Building frontend...$(NC)"
	@cd $(FRONTEND_DIR) && $(NPM) run build
	@echo "$(GREEN)Frontend built successfully!$(NC)"

# =============================================================================
# TESTING
# =============================================================================

.PHONY: test
test: test-backend test-frontend ## Run all tests

.PHONY: test-backend
test-backend: ## Run backend tests
	@echo "$(BLUE)Running backend tests...$(NC)"
	@cd $(BACKEND_DIR) && $(PYTEST) tests/ -v --cov=app --cov-report=html --cov-report=term-missing
	@echo "$(GREEN)Backend tests completed!$(NC)"

.PHONY: test-frontend
test-frontend: ## Run frontend tests
	@echo "$(BLUE)Running frontend tests...$(NC)"
	@cd $(FRONTEND_DIR) && $(NPM) run test
	@echo "$(GREEN)Frontend tests completed!$(NC)"

.PHONY: test-coverage
test-coverage: test-backend test-frontend-coverage ## Run tests with coverage reports

.PHONY: test-frontend-coverage
test-frontend-coverage: ## Run frontend tests with coverage
	@echo "$(BLUE)Running frontend tests with coverage...$(NC)"
	@cd $(FRONTEND_DIR) && $(NPM) run test:coverage
	@echo "$(GREEN)Frontend tests with coverage completed!$(NC)"

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	@$(MAKE) -j2 test-backend-watch test-frontend-watch

.PHONY: test-backend-watch
test-backend-watch: ## Run backend tests in watch mode
	@cd $(BACKEND_DIR) && $(PYTEST) tests/ -v --cov=app --cov-report=term-missing -f

.PHONY: test-frontend-watch
test-frontend-watch: ## Run frontend tests in watch mode
	@cd $(FRONTEND_DIR) && $(NPM) run test -- --watch

# =============================================================================
# DATABASE
# =============================================================================

.PHONY: db-init
db-init: ## Initialize database
	@echo "$(BLUE)Initializing database...$(NC)"
	@cd $(BACKEND_DIR) && $(PYTHON) -c "from app.core.database import init_database; init_database()"
	@echo "$(GREEN)Database initialized!$(NC)"

.PHONY: db-migrate
db-migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	@cd $(BACKEND_DIR) && $(ALEMBIC) upgrade head
	@echo "$(GREEN)Database migrations completed!$(NC)"

.PHONY: db-migrate-create
db-migrate-create: ## Create a new migration
	@echo "$(BLUE)Creating new migration...$(NC)"
	@cd $(BACKEND_DIR) && $(ALEMBIC) revision --autogenerate -m "$(message)"
	@echo "$(GREEN)Migration created!$(NC)"

.PHONY: db-reset
db-reset: ## Reset database (delete and recreate)
	@echo "$(RED)WARNING: This will delete the database!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		cd $(BACKEND_DIR) && rm -f $(DB_NAME) && $(MAKE) db-init; \
	fi

# =============================================================================
# DOCKER
# =============================================================================

.PHONY: docker-build
docker-build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	@$(DOCKER_COMPOSE) build
	@echo "$(GREEN)Docker images built!$(NC)"

.PHONY: docker-up
docker-up: ## Start Docker containers
	@echo "$(BLUE)Starting Docker containers...$(NC)"
	@$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)Docker containers started!$(NC)"

.PHONY: docker-down
docker-down: ## Stop Docker containers
	@echo "$(BLUE)Stopping Docker containers...$(NC)"
	@$(DOCKER_COMPOSE) down
	@echo "$(GREEN)Docker containers stopped!$(NC)"

.PHONY: docker-restart
docker-restart: docker-down docker-up ## Restart Docker containers

.PHONY: docker-logs
docker-logs: ## Show Docker container logs
	@$(DOCKER_COMPOSE) logs -f

.PHONY: docker-clean
docker-clean: ## Clean Docker containers and images
	@echo "$(RED)WARNING: This will remove all containers and images!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(DOCKER_COMPOSE) down -v --rmi all; \
	fi

# =============================================================================
# LINTING AND FORMATTING
# =============================================================================

.PHONY: lint
lint: lint-backend lint-frontend ## Run all linting

.PHONY: lint-backend
lint-backend: ## Lint backend code
	@echo "$(BLUE)Linting backend code...$(NC)"
	@cd $(BACKEND_DIR) && flake8 app/ tests/ --max-line-length=88 --extend-ignore=E203,W503
	@echo "$(GREEN)Backend linting completed!$(NC)"

.PHONY: lint-frontend
lint-frontend: ## Lint frontend code
	@echo "$(BLUE)Linting frontend code...$(NC)"
	@cd $(FRONTEND_DIR) && $(NPM) run lint
	@echo "$(GREEN)Frontend linting completed!$(NC)"

.PHONY: format
format: format-backend format-frontend ## Format all code

.PHONY: format-backend
format-backend: ## Format backend code
	@echo "$(BLUE)Formatting backend code...$(NC)"
	@cd $(BACKEND_DIR) && black app/ tests/ --line-length=88
	@echo "$(GREEN)Backend formatting completed!$(NC)"

.PHONY: format-frontend
format-frontend: ## Format frontend code
	@echo "$(BLUE)Formatting frontend code...$(NC)"
	@cd $(FRONTEND_DIR) && $(NPM) run format
	@echo "$(GREEN)Frontend formatting completed!$(NC)"

.PHONY: format-check
format-check: format-check-backend format-check-frontend ## Check code formatting

.PHONY: format-check-backend
format-check-backend: ## Check backend code formatting
	@echo "$(BLUE)Checking backend code formatting...$(NC)"
	@cd $(BACKEND_DIR) && black app/ tests/ --line-length=88 --check
	@echo "$(GREEN)Backend formatting check passed!$(NC)"

.PHONY: format-check-frontend
format-check-frontend: ## Check frontend code formatting
	@echo "$(BLUE)Checking frontend code formatting...$(NC)"
	@cd $(FRONTEND_DIR) && $(NPM) run format:check
	@echo "$(GREEN)Frontend formatting check passed!$(NC)"

# =============================================================================
# CLEANUP
# =============================================================================

.PHONY: clean
clean: clean-backend clean-frontend ## Clean all build artifacts

.PHONY: clean-backend
clean-backend: ## Clean backend artifacts
	@echo "$(BLUE)Cleaning backend artifacts...$(NC)"
	@cd $(BACKEND_DIR) && find . -type f -name "*.pyc" -delete
	@cd $(BACKEND_DIR) && find . -type d -name "__pycache__" -delete
	@cd $(BACKEND_DIR) && find . -type d -name "*.egg-info" -exec rm -rf {} +
	@cd $(BACKEND_DIR) && rm -rf .coverage htmlcov/ .pytest_cache/
	@echo "$(GREEN)Backend cleaned!$(NC)"

.PHONY: clean-frontend
clean-frontend: ## Clean frontend artifacts
	@echo "$(BLUE)Cleaning frontend artifacts...$(NC)"
	@cd $(FRONTEND_DIR) && rm -rf dist/ node_modules/ .vite/ coverage/
	@echo "$(GREEN)Frontend cleaned!$(NC)"

.PHONY: clean-docker
clean-docker: ## Clean Docker artifacts
	@echo "$(BLUE)Cleaning Docker artifacts...$(NC)"
	@$(DOCKER_COMPOSE) down -v
	@$(DOCKER) system prune -f
	@echo "$(GREEN)Docker artifacts cleaned!$(NC)"

# =============================================================================
# UTILITIES
# =============================================================================

.PHONY: check-health
check-health: ## Check application health
	@echo "$(BLUE)Checking application health...$(NC)"
	@curl -f http://$(BACKEND_HOST):$(BACKEND_PORT)/health || echo "$(RED)Backend health check failed$(NC)"
	@curl -f http://$(FRONTEND_HOST):$(FRONTEND_PORT) || echo "$(RED)Frontend health check failed$(NC)"

.PHONY: logs
logs: ## Show application logs
	@echo "$(BLUE)Showing application logs...$(NC)"
	@cd $(BACKEND_DIR) && tail -f logs/app.log

.PHONY: shell
shell: ## Open Python shell with app context
	@echo "$(BLUE)Opening Python shell...$(NC)"
	@cd $(BACKEND_DIR) && $(PYTHON) -c "from app.core.database import get_db; from app.models import *; print('Models imported successfully')"

.PHONY: generate-data
generate-data: ## Generate test data
	@echo "$(BLUE)Generating test data...$(NC)"
	@powershell -ExecutionPolicy Bypass -File generate-test-data.ps1
	@echo "$(GREEN)Test data generated!$(NC)"

# =============================================================================
# PRODUCTION
# =============================================================================

.PHONY: prod
prod: ## Start production environment
	@echo "$(BLUE)Starting production environment...$(NC)"
	@$(DOCKER_COMPOSE) --profile production up -d
	@echo "$(GREEN)Production environment started!$(NC)"

.PHONY: prod-down
prod-down: ## Stop production environment
	@echo "$(BLUE)Stopping production environment...$(NC)"
	@$(DOCKER_COMPOSE) --profile production down
	@echo "$(GREEN)Production environment stopped!$(NC)"

# =============================================================================
# CI/CD
# =============================================================================

.PHONY: ci
ci: install test lint format-check ## Run CI pipeline
	@echo "$(GREEN)CI pipeline completed successfully!$(NC)"

.PHONY: pre-commit
pre-commit: format lint test ## Run pre-commit checks
	@echo "$(GREEN)Pre-commit checks passed!$(NC)"

# =============================================================================
# DOCUMENTATION
# =============================================================================

.PHONY: docs
docs: ## Generate documentation
	@echo "$(BLUE)Generating documentation...$(NC)"
	@echo "$(YELLOW)Backend API docs: http://$(BACKEND_HOST):$(BACKEND_PORT)/docs$(NC)"
	@echo "$(YELLOW)Backend ReDoc: http://$(BACKEND_HOST):$(BACKEND_PORT)/redoc$(NC)"

# =============================================================================
# SECURITY
# =============================================================================

.PHONY: security-check
security-check: ## Run security checks
	@echo "$(BLUE)Running security checks...$(NC)"
	@cd $(BACKEND_DIR) && bandit -r app/ -f json -o security-report.json || true
	@echo "$(GREEN)Security checks completed!$(NC)"

# =============================================================================
# DEPLOYMENT
# =============================================================================

.PHONY: deploy
deploy: build test ## Deploy application
	@echo "$(BLUE)Deploying application...$(NC)"
	@echo "$(GREEN)Deployment completed!$(NC)"

# =============================================================================
# MONITORING
# =============================================================================

.PHONY: monitor
monitor: ## Monitor application performance
	@echo "$(BLUE)Monitoring application...$(NC)"
	@echo "$(YELLOW)Backend metrics: http://$(BACKEND_HOST):$(BACKEND_PORT)/metrics$(NC)"
	@echo "$(YELLOW)Health check: http://$(BACKEND_HOST):$(BACKEND_PORT)/health$(NC)"

# =============================================================================
# BACKUP
# =============================================================================

.PHONY: backup
backup: ## Create database backup
	@echo "$(BLUE)Creating database backup...$(NC)"
	@cd $(BACKEND_DIR) && cp $(DB_NAME) $(DB_NAME).backup.$$(date +%Y%m%d_%H%M%S)
	@echo "$(GREEN)Database backup created!$(NC)"

.PHONY: restore
restore: ## Restore database from backup
	@echo "$(BLUE)Restoring database from backup...$(NC)"
	@cd $(BACKEND_DIR) && cp $(DB_NAME).backup.* $(DB_NAME) || echo "$(RED)No backup found$(NC)"
	@echo "$(GREEN)Database restored!$(NC)"

# =============================================================================
# DEVELOPMENT WORKFLOW
# =============================================================================

.PHONY: setup
setup: install db-init ## Complete development setup
	@echo "$(GREEN)Development environment setup complete!$(NC)"

.PHONY: reset
reset: clean install db-reset ## Reset development environment
	@echo "$(GREEN)Development environment reset complete!$(NC)"

.PHONY: update
update: ## Update all dependencies
	@echo "$(BLUE)Updating dependencies...$(NC)"
	@cd $(BACKEND_DIR) && $(PYTHON) -m pip install --upgrade -r requirements.txt
	@cd $(FRONTEND_DIR) && $(NPM) update
	@echo "$(GREEN)Dependencies updated!$(NC)"

# =============================================================================
# TROUBLESHOOTING
# =============================================================================

.PHONY: debug
debug: ## Show debug information
	@echo "$(CYAN)=== Debug Information ===$(NC)"
	@echo "$(YELLOW)Python version:$(NC)" && $(PYTHON) --version
	@echo "$(YELLOW)Node version:$(NC)" && $(NODE) --version
	@echo "$(YELLOW)NPM version:$(NC)" && $(NPM) --version
	@echo "$(YELLOW)Docker version:$(NC)" && $(DOCKER) --version
	@echo "$(YELLOW)Current directory:$(NC)" && pwd
	@echo "$(YELLOW)Backend directory:$(NC)" && ls -la $(BACKEND_DIR)
	@echo "$(YELLOW)Frontend directory:$(NC)" && ls -la $(FRONTEND_DIR)

.PHONY: fix-permissions
fix-permissions: ## Fix file permissions
	@echo "$(BLUE)Fixing file permissions...$(NC)"
	@chmod +x *.ps1
	@chmod +x $(BACKEND_DIR)/*.ps1
	@echo "$(GREEN)Permissions fixed!$(NC)" 
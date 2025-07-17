# Wingstop Inventory Backend Setup Script (using pip)
Write-Host "Setting up Wingstop Inventory Backend with pip..." -ForegroundColor Green

# Create virtual environment
Write-Host "Creating virtual environment..." -ForegroundColor Green
python -m venv venv

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Green
.\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Green
pip install -r requirements.txt

# Initialize Alembic
Write-Host "Initializing Alembic for database migrations..." -ForegroundColor Green
alembic init alembic

Write-Host "Setup complete! You can now run the backend with:" -ForegroundColor Green
Write-Host "python main.py" -ForegroundColor Cyan
Write-Host "Note: Make sure to activate the virtual environment first with: .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow 
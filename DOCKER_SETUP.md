# DATreeMap Docker Setup Guide

## Table of Contents
- [1. Project Structure](#1-project-structure)
- [2. Docker Configuration Files](#2-docker-configuration-files)
  - [2.1 Dockerfile](#21-dockerfile)
  - [2.2 docker-compose.yml](#22-docker-composeyml)
  - [2.3 .env File](#23-env-file)
- [3. Setup Process](#3-setup-process)
  - [3.1 Initial Setup](#31-initial-setup)
  - [3.2 Database Initialization](#32-database-initialization)
- [4. Key Configuration Points](#4-key-configuration-points)
  - [4.1 GDAL/GEOS Configuration](#41-gdalgeos-configuration)
  - [4.2 Database Configuration](#42-database-configuration)
  - [4.3 Development/Production Environment Separation](#43-developmentproduction-environment-separation)
- [5. Troubleshooting](#5-troubleshooting)
  - [5.1 Poetry Dependency Issues](#51-poetry-dependency-issues)
  - [5.2 Database Connection Issues](#52-database-connection-issues)
  - [5.3 GDAL Library Issues](#53-gdal-library-issues)
- [6. Useful Commands](#6-useful-commands)
  - [6.1 Container Management](#61-container-management)
  - [6.2 Django Management](#62-django-management)
  - [6.3 Database Management](#63-database-management)
  - [6.4 Data Management](#64-data-management)

## 1. Project Structure
```
DATreeMap-test/
├── config/                 # Django project settings
│   ├── settings.py         # Project settings file
│   ├── urls.py             # URL routing
│   └── wsgi.py             # WSGI configuration
├── trees/                  # Tree data app
│   ├── management/         # Django management commands
│   │   └── commands/       # Custom commands
│   │       ├── import_trees.py  # Tree data import
│   │       └── wait_for_db.py   # DB connection wait
│   ├── models.py           # Data models
│   ├── views.py            # View functions
│   └── urls.py             # URL routing
├── users/                  # User management app
├── static/                 # Static files
├── templates/              # HTML templates
├── Dockerfile              # Docker image configuration
├── docker-compose.yml      # Docker services setup
├── docker-compose.prod.yml # Production Docker setup
├── pyproject.toml          # Python dependency management
├── poetry.lock             # Poetry dependency lock file
├── start.sh                # Startup script
└── .env                    # Environment variables
```

## 2. Docker Configuration Files

### 2.1 Dockerfile
```dockerfile
# Base common image
FROM python:3.12-slim AS base

# Environment variables setup
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Working directory setup
WORKDIR /app

# System dependencies installation (PostGIS, GDAL, GEOS, etc.)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        binutils \
        libproj-dev \
        gdal-bin \
        libgdal-dev \
        libgeos-dev \
        build-essential \
        postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# GDAL environment variables setup
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal
ENV LIBRARY_PATH=/usr/lib/aarch64-linux-gnu
ENV LD_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu
ENV GDAL_DATA=/usr/share/gdal
ENV GDAL_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgdal.so
ENV GEOS_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgeos_c.so

# Python dependency files copy and installation
COPY pyproject.toml poetry.lock ./
RUN pip install --upgrade pip \
    && pip install poetry \
    && poetry config virtualenvs.create false

# Development environment
FROM base AS development
RUN poetry install --no-interaction --no-ansi --no-root
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Production environment
FROM base AS production
RUN poetry install --no-dev --no-interaction --no-ansi --no-root
COPY . .
RUN python manage.py collectstatic --noinput
EXPOSE 8000
CMD ["sh", "start.sh"]
```

### 2.2 docker-compose.yml
```yaml
version: '3.8'

services:
  # Django web application
  web:
    build: 
      context: .
      target: development
    command: >
      sh -c "python manage.py wait_for_db &&
             python manage.py migrate &&
             python manage.py runserver 0.0.0.0:8000"
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    environment:
      - DJANGO_SETTINGS_MODULE=config.settings
      - DEBUG=1
      - SECRET_KEY=${DJANGO_SECRET_KEY:-django-insecure-your-secret-key-here}
      - DB_NAME=${DB_NAME:-datreemap}
      - DB_USER=${DB_USER:-datreemap}
      - DB_PASSWORD=${DB_PASSWORD:-datreemap}
      - DB_HOST=${DB_HOST:-db}
      - DB_PORT=${DB_PORT:-5432}
      - GDAL_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgdal.so
      - GEOS_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgeos_c.so
    env_file:
      - .env

  # PostgreSQL/PostGIS database
  db:
    image: postgis/postgis:15-3.4
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=${DB_NAME:-datreemap}
      - POSTGRES_USER=${DB_USER:-datreemap}
      - POSTGRES_PASSWORD=${DB_PASSWORD:-datreemap}
    expose:
      - "5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-datreemap} -d ${DB_NAME:-datreemap}"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

### 2.3 .env File
```env
# Django settings
DJANGO_SECRET_KEY=django-insecure-your-secret-key-here
DEBUG=1

# Database settings
DB_NAME=datreemap
DB_USER=datreemap
DB_PASSWORD=datreemap
DB_HOST=db
DB_PORT=5432

# GDAL/GEOS settings
GDAL_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgdal.so
GEOS_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgeos_c.so

# Other settings
ALLOWED_HOSTS=localhost 127.0.0.1
IN_DOCKER=True
```

## 3. Setup Process

### 3.1 Initial Setup
1. Clone the project:
   ```bash
   git clone <repository-url>
   cd DATreeMap-test
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   # Modify environment variables if needed
   ```

3. Update Poetry dependencies:
   ```bash
   poetry lock
   ```

4. Build and run Docker containers:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

### 3.2 Database Initialization
1. Run database migrations:
   ```bash
   docker-compose exec web python manage.py migrate
   ```

2. Import tree data:
   ```bash
   docker-compose exec web python manage.py import_trees "Tree Dataset_De Anza College_Backup.csv"
   ```

3. Create admin account:
   ```bash
   docker-compose exec web python manage.py createsuperuser
   ```

4. Access the application:
   - Web application: http://localhost:8000
   - Admin page: http://localhost:8000/admin

## 4. Key Configuration Points

### 4.1 GDAL/GEOS Configuration
- Library path settings for ARM64 architecture (M1/M2 Mac)
  - `/usr/lib/aarch64-linux-gnu/libgdal.so`
  - `/usr/lib/aarch64-linux-gnu/libgeos_c.so`
- Library path management through environment variables
- Dynamic library path reference in Django settings

### 4.2 Database Configuration
- Using PostgreSQL/PostGIS (for spatial data support)
- Database connection wait function implementation (`wait_for_db` custom command)
- Data persistence through volumes (`postgres_data` volume)
- Connection information management through environment variables

### 4.3 Development/Production Environment Separation
- Environment-specific image optimization through multi-stage build
  - `development` stage: includes development dependencies, runs development server
  - `production` stage: excludes development dependencies, uses Gunicorn
- Configuration management through environment variables (`.env` file)
- Automatic code reload in development environment (volume mount)
- Separate static/media file management

## 5. Troubleshooting

### 5.1 Poetry Dependency Issues
- When `poetry.lock` file is not synchronized with `pyproject.toml`:
  ```bash
  poetry lock
  ```
- When Poetry update is needed in Docker environment:
  ```bash
  docker run --rm -v $(pwd):/app -w /app python:3.12-slim bash -c "pip install poetry && poetry lock"
  ```

### 5.2 Database Connection Issues
- Configure to wait until the database service is completely ready
  - Use `depends_on` with `condition: service_healthy`
  - Implement `wait_for_db` custom command
- Debug connection issues:
  ```bash
  docker-compose exec db psql -U datreemap -d datreemap -c "\l"
  ```

### 5.3 GDAL Library Issues
- ARM64 architecture library path settings
  - `/usr/lib/aarch64-linux-gnu/libgdal.so`
  - `/usr/lib/aarch64-linux-gnu/libgeos_c.so`
- Check library version:
  ```bash
  docker-compose exec web gdal-config --version
  ```
- Check library path:
  ```bash
  docker-compose exec web find / -name "libgdal.so*" 2>/dev/null
  ```

## 6. Useful Commands

### 6.1 Container Management
```bash
# Start containers
docker-compose up

# Start containers in background
docker-compose up -d

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# Check logs
docker-compose logs -f

# Check logs for specific service
docker-compose logs -f web
```

### 6.2 Django Management
```bash
# Run migrations
docker-compose exec web python manage.py migrate

# Create migrations
docker-compose exec web python manage.py makemigrations

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Run Django shell
docker-compose exec web python manage.py shell

# Collect static files
docker-compose exec web python manage.py collectstatic --noinput
```

### 6.3 Database Management
```bash
# Connect to database
docker-compose exec db psql -U datreemap -d datreemap

# Backup database
docker-compose exec db pg_dump -U datreemap datreemap > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T db psql -U datreemap -d datreemap

# Reset database (caution: deletes all data)
docker-compose down -v
docker-compose up --build
```

### 6.4 Data Management
```bash
# Import tree data
docker-compose exec web python manage.py import_trees "Tree Dataset_De Anza College_Backup.csv"

# Export tree data (JSON format)
docker-compose exec web python manage.py dumpdata trees.Tree > trees_backup.json

# Restore tree data
docker-compose exec web python manage.py loaddata trees_backup.json

# Query data (Django shell)
docker-compose exec web python manage.py shell -c "from trees.models import Tree; print(f'Total tree count: {Tree.objects.count()}')"
```
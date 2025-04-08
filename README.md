# De Anza Treemap

A web application for visualizing and managing tree data on the De Anza campus. Built with Django and PostGIS, this application provides an interactive map interface to explore trees on campus.

[![한국어](https://img.shields.io/badge/언어-한국어-blue)](README.ko.md)

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
  - [Using Docker (Recommended)](#using-docker-recommended)
  - [Local Development Setup](#local-development-setup)
- [Importing Tree Data](#importing-tree-data)
- [API Endpoints](#api-endpoints)
- [Development and Production Environments](#development-and-production-environments)
- [Custom User Model](#custom-user-model)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Production Deployment Considerations](#production-deployment-considerations)
- [Running Tests](#running-tests)
- [Contributing](#contributing)
- [License](#license)

## Features

- Interactive map visualization of tree data
- Detailed tree information display
- REST API for accessing tree data
- Tree data import from CSV files
- User authentication and permission management

## Tech Stack

- **Backend**: Django 5.1.6
- **Database**: PostgreSQL + PostGIS (for spatial data)
- **API**: Django REST Framework
- **Frontend**: JavaScript, Leaflet.js (map library)
- **Deployment**: Docker, Docker Compose
- **Dependency Management**: Poetry

## Project Structure

The project consists of the following main apps:

- **trees**: Models and views for tree data management
- **users**: Custom user account and profile management

## Installation and Setup

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd [repository-folder]
   ```

2. Create and configure the `.env` file (if needed):
   ```bash
   cp .env.example .env
   # Edit the .env file if needed
   ```

   The `.env` file should contain the following variables:
   ```
   # Django settings
   DJANGO_SECRET_KEY=django-insecure-your-secret-key-here
   DEBUG=1  # Set to 0 for production

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

   Key considerations when editing the `.env` file:
   - For security, change the `DJANGO_SECRET_KEY` to a unique, random string in production
   - Set `DEBUG=0` in production environments
   - **Database security**:
     - Use strong, unique passwords for database users
     - Consider using environment-specific database credentials
     - In production, create a database user with limited permissions
     - Never use 'root' or default passwords in production
     - Consider using database connection pooling for production
   - Adjust database credentials as needed
   - For different architectures, update the GDAL/GEOS paths:
     - ARM64 (M1/M2 Mac): use `/usr/lib/aarch64-linux-gnu/libgdal.so`
     - Intel/AMD64: use `/usr/lib/libgdal.so` 
   - Update `ALLOWED_HOSTS` to include your domain in production

3. Update Poetry dependencies:
   ```bash
   poetry lock
   ```

4. Start services using Docker Compose:
   ```bash
   docker-compose up --build
   ```

5. Initialize the database:
   ```bash
   # In a new terminal
   docker-compose exec web python manage.py migrate
   docker-compose exec web python manage.py import_trees "Tree Dataset_De Anza College_Backup.csv"
   docker-compose exec web python manage.py createsuperuser
   ```

6. Access the application in your web browser:
   ```
   http://localhost:8000
   ```
   
   Admin interface:
   ```
   http://localhost:8000/admin
   ```

### Local Development Setup

1. Install system dependencies:
   - Python 3.12
   - PostgreSQL with PostGIS extension
   - GDAL and GEOS libraries

2. Install Python dependencies using Poetry:
   ```bash
   pip install poetry
   poetry install
   ```

3. Configure database settings:
   ```bash
   export DB_NAME=datreemap
   export DB_USER=your_username
   export DB_PASSWORD=your_password
   export DB_HOST=localhost
   export DB_PORT=5432
   ```

4. Set GDAL/GEOS library paths:
   ```bash
   # For macOS with ARM64 architecture (M1/M2 Mac)
   export GDAL_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgdal.so
   export GEOS_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgeos_c.so
   
   # For Intel Mac or Linux
   export GDAL_LIBRARY_PATH=/usr/lib/libgdal.so
   export GEOS_LIBRARY_PATH=/usr/lib/libgeos_c.so
   ```

5. Run database migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

## Importing Tree Data

A custom management command is provided to import tree data from CSV files:

```bash
# For Docker setup
docker-compose exec web python manage.py import_trees "Tree Dataset_De Anza College_Backup.csv"

# For local setup
python manage.py import_trees "Tree Dataset_De Anza College_Backup.csv"
```

You can also export and restore tree data using Django's dumpdata/loaddata commands:

```bash
# Export tree data
docker-compose exec web python manage.py dumpdata trees.Tree > trees_backup.json

# Restore tree data
docker-compose exec web python manage.py loaddata trees_backup.json
```

## API Endpoints

- Tree list: `/trees/api/rest/trees/`
- Tree detail: `/trees/api/rest/trees/<tag_number>/`
- Map tree data: `/trees/api/trees/`
- Tree detail data: `/trees/api/trees/<tag_number>/`

## Development and Production Environments

The Docker setup supports both development and production environments:

### Development
- Uses the `development` target in Dockerfile
- Mounts code as volume for live reloading
- Uses Django's development server (`runserver`)
- Set via `docker-compose.yml`

### Production
- Uses the `production` target in Dockerfile
- Uses Gunicorn as the WSGI server
- Collects static files automatically
- Set via `docker-compose.prod.yml`

```bash
# For production deployment
docker-compose -f docker-compose.prod.yml up --build -d
```

## Custom User Model

The project implements a custom user model with fields for:
- Profile picture
- Name
- Contributor status
- Gender
- Language preferences

## Environment Variables

Key environment variables:
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: Database connection details
- `DEBUG`: Enable/disable debug mode (1 or 0)
- `SECRET_KEY`: Django secret key
- `ALLOWED_HOSTS`: Allowed host domains
- `GDAL_LIBRARY_PATH`, `GEOS_LIBRARY_PATH`: Paths to GDAL/GEOS libraries
- `IN_DOCKER`: Flag to determine Docker environment (for library path settings)

## Troubleshooting

### GDAL Library Issues
If you encounter GDAL library errors:

```
OSError: /usr/lib/libgdal.so: cannot open shared object file: No such file or directory
```

Ensure the correct library paths are set in your environment:

```bash
# Check library locations
docker-compose exec web find / -name "libgdal.so*" 2>/dev/null

# Check GDAL version
docker-compose exec web gdal-config --version
```

ARM64 architecture (M1/M2 Mac) users should use:
```
GDAL_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgdal.so
GEOS_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgeos_c.so
```

### Poetry Dependency Issues
If you encounter Poetry dependency errors:

```bash
# Update lock file
poetry lock

# Within Docker environment
docker run --rm -v $(pwd):/app -w /app python:3.12-slim bash -c "pip install poetry && poetry lock"
```

### Database Connection Issues
If the web service can't connect to the database:

1. Ensure the database service is healthy:
   ```bash
   docker-compose logs db
   ```

2. Make sure the `DB_HOST` is set to `db` (the service name) in Docker environment

3. Check database connection manually:
   ```bash
   docker-compose exec db psql -U datreemap -d datreemap -c "\l"
   ```

## Production Deployment Considerations

For production deployment:
- Set `DEBUG=0` in `.env`
- Configure a secure `SECRET_KEY`
- Use HTTPS
- Set up proper static file serving
- Apply security settings (HSTS, XSS protection, etc.)
- Use the production Docker Compose file:
  ```bash
  docker-compose -f docker-compose.prod.yml up --build -d
  ```

## Running Tests

```bash
# For Docker setup
docker-compose exec web python manage.py test

# For local setup
python manage.py test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License

Copyright (c) 2025 [Environmental Monitoring Society]

---

This project is a web application utilizing Geographic Information Systems to visualize and manage tree data across the De Anza campus. 

For detailed Docker setup guide, see [DOCKER_SETUP.md](DOCKER_SETUP.md).

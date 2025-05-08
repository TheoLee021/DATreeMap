#!/bin/bash

# 프로덕션 빌드 스크립트
echo "Building production Docker images..."
docker-compose -f docker-compose.prod.yml build

echo "Starting production environment..."
docker-compose -f docker-compose.prod.yml up -d

echo "Production environment is running. Access at http://localhost" 
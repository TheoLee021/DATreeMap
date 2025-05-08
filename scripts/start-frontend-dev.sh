#!/bin/bash

# 개발 환경에서 React+Tailwind CSS 프론트엔드 실행 스크립트
echo "Starting frontend development environment with Docker..."
docker-compose -f docker-compose.dev.yml up frontend 
#!/bin/bash

# 전체 개발 환경(백엔드+프론트엔드) 실행 스크립트
echo "Starting full development environment with Docker..."
docker-compose -f docker-compose.dev.yml up 
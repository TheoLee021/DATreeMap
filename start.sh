#!/bin/bash
set -e

# 데이터베이스 준비 대기
echo "데이터베이스 준비 대기 중..."
python manage.py wait_for_db

# 데이터베이스 마이그레이션 실행
echo "마이그레이션 실행 중..."
python manage.py migrate

# 정적 파일 수집
python manage.py collectstatic --noinput

# Nginx 시작
service nginx start

# Django 애플리케이션 실행 (gunicorn 사용)
echo "Django 애플리케이션 시작..."
gunicorn config.wsgi:application --bind 0.0.0.0:8000
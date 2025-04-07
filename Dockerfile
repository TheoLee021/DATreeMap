# 공통 베이스 이미지
FROM python:3.12-slim AS base

# 환경 변수 설정
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 의존성 설치 (PostGIS, GDAL, GEOS 등)
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

# GDAL 환경 변수 설정
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal
ENV LIBRARY_PATH=/usr/lib/aarch64-linux-gnu
ENV LD_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu
ENV GDAL_DATA=/usr/share/gdal
ENV GDAL_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgdal.so
ENV GEOS_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgeos_c.so

# Python 의존성 파일 복사 및 설치
COPY pyproject.toml poetry.lock ./
RUN pip install --upgrade pip \
    && pip install poetry \
    && poetry config virtualenvs.create false

# 개발 환경
FROM base AS development
RUN poetry install --no-interaction --no-ansi --no-root
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# 프로덕션 환경
FROM base AS production
RUN poetry install --no-dev --no-interaction --no-ansi --no-root
COPY . .
RUN python manage.py collectstatic --noinput
EXPOSE 8000
CMD ["sh", "start.sh"] 
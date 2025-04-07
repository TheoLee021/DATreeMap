FROM python:3.12-slim

WORKDIR /app

# GDAL 및 기타 필요한 시스템 라이브러리 설치
RUN apt-get update && apt-get install -y \
    nginx \
    binutils \
    libproj-dev \
    gdal-bin \
    libgdal-dev \
    python3-gdal \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# GDAL 환경변수 설정
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal
ENV LIBRARY_PATH=/usr/lib
ENV LD_LIBRARY_PATH=/usr/lib
ENV GDAL_DATA=/usr/share/gdal

# 실제 라이브러리 파일 확인 및 심볼릭 링크 생성
RUN ldconfig && \
    ln -s $(find /usr/lib -name "libgdal.so.*" | head -n 1) /usr/lib/libgdal.so && \
    ln -s $(find /usr/lib -name "libgeos_c.so.*" | head -n 1) /usr/lib/libgeos_c.so

COPY nginx.conf /etc/nginx/conf.d/default.conf

# pyproject.toml과 README.md 먼저 복사
COPY pyproject.toml README.md ./

# 먼저 모든 파일 복사
COPY . .

# 그 다음 Poetry 설치 및 의존성 설치
RUN pip install --upgrade pip \
    && pip install poetry \
    && poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi

COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
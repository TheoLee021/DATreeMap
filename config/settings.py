"""
Django settings for config project.

Generated by 'django-admin startproject' using Django 5.1.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-)0p7o#5483$=)--nb(=mr(jh05_5p_p^mv#xe@%bm_+ohz=f=4'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# 데이터베이스 설정을 환경 변수에서 가져옴
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.environ.get('DB_NAME', 'datreemap'),
        'USER': os.environ.get('DB_USER', 'theo'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'db'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# ALLOWED_HOSTS 설정
ALLOWED_HOSTS = ['*']  # 개발 환경에서는 모든 호스트 허용


# Application definition

CUSTUM_APPS = [
    'users.apps.UsersConfig',
    'trees.apps.TreesConfig',
    'common.apps.CommonConfig',
]

SYSTEM_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

ADDITIONAL_APPS = [
    'django.contrib.gis',
    'rest_framework',
    'rest_framework_gis',
]

INSTALLED_APPS = SYSTEM_APPS + CUSTUM_APPS + ADDITIONAL_APPS

# 먼저 MIDDLEWARE 정의
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# React 애플리케이션 정적 파일 경로 추가
# 개발 환경에서는 프론트엔드가 Vite 서버를 통해 제공됨
# 프로덕션 환경에서는 빌드된 파일을 사용
if not DEBUG and os.path.exists(BASE_DIR / 'frontend' / 'dist'):
    STATICFILES_DIRS.append(BASE_DIR / 'frontend' / 'dist')

# 정적 파일 수집 경로
STATIC_ROOT = BASE_DIR / 'staticfiles'

# 미디어 파일 설정
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Auth
AUTH_USER_MODEL = 'users.User'

# GDAL 설정
GDAL_LIBRARY_PATH = os.environ.get('GDAL_LIBRARY_PATH', '/usr/lib/aarch64-linux-gnu/libgdal.so')
GEOS_LIBRARY_PATH = os.environ.get('GEOS_LIBRARY_PATH', '/usr/lib/aarch64-linux-gnu/libgeos_c.so')

# REST Framework 설정 (settings.py 맨 아래에 추가)
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
    ],
}

# # CORS 설정 - 개발 환경에서 프론트엔드와 통신하기 위함
# if DEBUG:
#     INSTALLED_APPS.append('corsheaders')
#     MIDDLEWARE.insert(1, 'corsheaders.middleware.CorsMiddleware')
#     CORS_ALLOW_ALL_ORIGINS = True
#     CORS_ALLOW_CREDENTIALS = True
import time
from django.db import connections
from django.db.utils import OperationalError
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """Django 명령어: 데이터베이스가 사용 가능할 때까지 대기"""

    help = '데이터베이스가 사용 가능할 때까지 대기합니다'

    def handle(self, *args, **options):
        """명령어 실행"""
        self.stdout.write('데이터베이스 대기 중...')
        db_conn = None
        while not db_conn:
            try:
                db_conn = connections['default']
            except OperationalError:
                self.stdout.write('데이터베이스를 사용할 수 없습니다. 1초 후 다시 시도합니다...')
                time.sleep(1)

        self.stdout.write(self.style.SUCCESS('데이터베이스 연결 성공!')) 
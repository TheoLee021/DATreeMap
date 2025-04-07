import csv
import datetime
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from trees.models import Tree

class Command(BaseCommand):
    help = 'Import trees from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file']
        count = 0
        errors = 0
        
        with open(csv_file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                try:
                    # 필수 필드에 대한 기본값 설정
                    tag_number = int(float(row['Tag #'])) if row['Tag #'] else None
                    
                    # 이미 존재하는 트리인지 확인
                    if Tree.objects.filter(tag_number=tag_number).exists():
                        self.stdout.write(self.style.WARNING(f'Tree with tag {tag_number} already exists. Skipping.'))
                        continue
                    
                    # 좌표 변환
                    lat = float(row['Latitude']) if row['Latitude'] else None
                    lng = float(row['Longitude']) if row['Longitude'] else None
                    
                    # 날짜 변환
                    last_update = None
                    if row['Lastest Update']:
                        try:
                            last_update = datetime.datetime.strptime(row['Lastest Update'], '%m/%d/%Y').date()
                        except ValueError:
                            pass
                    
                    # 수량 변환
                    quantity = 1
                    if row['Qty'] and row['Qty'].isdigit():
                        quantity = int(row['Qty'])
                    
                    # 트리 객체 생성
                    tree = Tree(
                        tag_number=tag_number,
                        common_name=row['COMMON NAME'],
                        botanical_name=row['BOTANICAL NAME'],
                        latitude=lat,
                        longitude=lng,
                        diameter=row['Diameter'],
                        height=row['Height'],
                        crown_height=row['Crown height'],
                        crown_spread=row['Crown Spread'],
                        health=row['Health'],
                        last_update=last_update,
                        notes=row['Note'],
                        alternate_tag=row['Tag ##'],
                        quantity=quantity,
                    )
                    
                    # location은 save() 메서드에서 자동 설정됨
                    tree.save()
                    count += 1
                    
                    # 진행 상황 표시
                    if count % 100 == 0:
                        self.stdout.write(self.style.SUCCESS(f'Imported {count} trees so far...'))
                
                except Exception as e:
                    errors += 1
                    self.stdout.write(self.style.ERROR(f'Error importing tree {row.get("Tag #", "unknown")}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'Successfully imported {count} trees with {errors} errors')) 
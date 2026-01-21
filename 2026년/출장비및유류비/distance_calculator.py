import requests
import json

class DistanceCalculator:
    def __init__(self, api_key, price_per_km=172):
        self.api_key = api_key
        self.headers = {"Authorization": f"KakaoAK {api_key}"}
        self.price_per_km = price_per_km  # km당 기준금액 (원)
    
    def get_coordinates(self, address):
        """주소를 좌표로 변환"""
        # 1. 주소 검색 시도
        url = "https://dapi.kakao.com/v2/local/search/address.json"
        params = {"query": address}
        
        response = requests.get(url, headers=self.headers, params=params)
        result = response.json()
        
        if result.get('documents'):
            x = result['documents'][0]['x']
            y = result['documents'][0]['y']
            return x, y
        
        # 2. 주소 검색 실패 시 키워드 검색 시도
        url = "https://dapi.kakao.com/v2/local/search/keyword.json"
        response = requests.get(url, headers=self.headers, params=params)
        result = response.json()
        
        if result.get('documents'):
            x = result['documents'][0]['x']
            y = result['documents'][0]['y']
            place_name = result['documents'][0].get('place_name', '')
            address_name = result['documents'][0].get('address_name', '')
            print(f"   ℹ️  키워드 검색으로 찾음: {place_name} ({address_name})")
            return x, y
        
        raise ValueError(f"주소를 찾을 수 없습니다: {address}")
    
    def get_driving_distance(self, start_addr, end_addr, priority='RECOMMEND'):
        """주행거리 계산 (km)"""
        try:
            # 좌표 변환
            start_x, start_y = self.get_coordinates(start_addr)
            end_x, end_y = self.get_coordinates(end_addr)
            
            # 경로 조회
            url = "https://apis-navi.kakaomobility.com/v1/directions"
            params = {
                "origin": f"{start_x},{start_y}",
                "destination": f"{end_x},{end_y}",
                "priority": priority
            }
            
            response = requests.get(url, headers=self.headers, params=params)
            result = response.json()
            
            if 'routes' not in result or not result['routes']:
                raise ValueError("경로를 찾을 수 없습니다")
            
            distance_m = result['routes'][0]['summary']['distance']
            duration_sec = result['routes'][0]['summary']['duration']
            toll = result['routes'][0]['summary'].get('fare', {}).get('toll', 0)
            
            distance_km = distance_m / 1000
            duration_min = duration_sec / 60
            
            # 유류비 계산: 거리(km) X 172원 (원단위 절사)
            fuel_cost = int(distance_km * self.price_per_km / 10) * 10
            
            return {
                'distance_km': round(distance_km, 2),
                'distance_m': distance_m,
                'duration_min': round(duration_min, 0),
                'duration_sec': duration_sec,
                'fuel_cost': fuel_cost,
                'toll': toll,
                'priority': priority
            }
        
        except Exception as e:
            return {'error': str(e)}
    
    def compare_routes(self, start_addr, end_addr):
        """경로 옵션 비교 (추천/빠른길/최단거리)"""
        priorities = {
            'RECOMMEND': '추천 경로',
            'TIME': '빠른 길',
            'DISTANCE': '최단 거리'
        }
        
        results = {}
        for priority, name in priorities.items():
            result = self.get_driving_distance(start_addr, end_addr, priority)
            if 'error' not in result:
                results[name] = result
        
        return results


if __name__ == "__main__":
    # API 키
    API_KEY = "d94166660f1d5b2b0669f82303f82cb6"
    
    calculator = DistanceCalculator(API_KEY)
    
    print("\n=== 주행거리 계산 프로그램 ===\n")
    
    while True:
        start = input("출발지 주소: ").strip()
        if not start:
            break
        
        end = input("도착지 주소: ").strip()
        if not end:
            break
        
        compare = input("경로 옵션 비교? (y/n, 기본: n): ").strip().lower()
        
        if compare == 'y':
            print("\n경로 비교 중...")
            results = calculator.compare_routes(start, end)
            
            if results:
                print("\n" + "="*70)
                print("📊 경로 옵션 비교")
                print("="*70)
                
                for route_name, result in results.items():
                    total_cost = result['fuel_cost'] + result['toll']
                    print(f"\n🚗 {route_name}")
                    print(f"   거리: {result['distance_km']}km")
                    print(f"   시간: {result['duration_min']}분")
                    print(f"   통행료: {result['toll']:,}원")
                    print(f"   유류비: {result['fuel_cost']:,}원")
                    print(f"   총 비용: {total_cost:,}원")
                
                # 최적 경로 추천
                min_cost_route = min(results.items(), key=lambda x: x[1]['fuel_cost'] + x[1]['toll'])
                min_time_route = min(results.items(), key=lambda x: x[1]['duration_min'])
                
                print("\n" + "="*70)
                print(f"💰 최저 비용: {min_cost_route[0]} ({min_cost_route[1]['fuel_cost'] + min_cost_route[1]['toll']:,}원)")
                print(f"⚡ 최단 시간: {min_time_route[0]} ({min_time_route[1]['duration_min']}분)")
                print("="*70 + "\n")
            else:
                print("❌ 경로를 찾을 수 없습니다.\n")
        else:
            print("\n계산 중...")
            result = calculator.get_driving_distance(start, end)
            
            if 'error' in result:
                print(f"❌ 오류: {result['error']}\n")
            else:
                print(f"\n✅ 결과:")
                print(f"   주행거리: {result['distance_km']}km ({result['distance_m']}m)")
                print(f"   소요시간: {result['duration_min']}분 ({result['duration_sec']}초)")
                print(f"   통행료: {result['toll']:,}원")
                print(f"   유류비: {result['fuel_cost']:,}원\n")
        
        continue_yn = input("계속하시겠습니까? (y/n): ").strip().lower()
        if continue_yn != 'y':
            break
    
    print("\n프로그램을 종료합니다.")

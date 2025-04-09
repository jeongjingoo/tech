'use client';

import { useEffect, useRef, useState } from 'react';
import { School } from '../types/school';

// @ts-ignore
declare const kakao: any;

// 카카오맵 SDK 타입 확장
interface KakaoMapInfoWindowOptions {
  zIndex?: number;
}

interface KakaoMapProps {
  schools: School[];
  filter: string;
  onSchoolSelect: (school: School) => void;
}

export default function KakaoMap({ schools, filter, onSchoolSelect }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const scriptLoadedRef = useRef(false);

  // 필터링된 학교만 표시
  const filteredSchools = schools.filter(school => 
    filter === 'all' || school.data.team === filter
  );

  // 카카오맵 스크립트 로드
  useEffect(() => {
    // 이미 초기화 중이면 중복 실행 방지
    if (isInitializing) return;
    
    // 이미 로드된 경우 처리
    if (window.kakao && window.kakao.maps) {
      setIsMapLoaded(true);
      return;
    }

    setIsInitializing(true);

    // 스크립트가 이미 로드 중인지 확인
    const existingScript = document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]');
    if (existingScript) {
      // 스크립트가 이미 로드 중이면 onload 이벤트를 기다림
      existingScript.addEventListener('load', () => {
        scriptLoadedRef.current = true;
        setTimeout(() => {
          if (window.kakao && window.kakao.maps) {
            setIsMapLoaded(true);
          } else {
            setLoadError('카카오맵 SDK 로드 실패');
            console.error('카카오맵 SDK 로드 실패');
          }
          setIsInitializing(false);
        }, 2000);
      });
      return;
    }

    // 동기적으로 스크립트 로드
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=743b01fe8fe52caf6f21bc19d256eca8&libraries=services,clusterer,drawing`;
    script.async = false; // 비동기 로드 비활성화
    
    script.onload = () => {
      scriptLoadedRef.current = true;
      // 스크립트 로드 후 충분한 지연을 주어 카카오맵 SDK가 완전히 초기화되도록 함
      setTimeout(() => {
        if (window.kakao && window.kakao.maps) {
          setIsMapLoaded(true);
        } else {
          setLoadError('카카오맵 SDK 로드 실패');
          console.error('카카오맵 SDK 로드 실패');
        }
        setIsInitializing(false);
      }, 3000);
    };
    
    script.onerror = () => {
      setLoadError('카카오맵 SDK 스크립트 로드 실패');
      console.error('카카오맵 SDK 스크립트 로드 실패');
      setIsInitializing(false);
    };
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      setIsInitializing(false);
    };
  }, [isInitializing]);

  // 지도 초기화 및 마커 생성
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    try {
      // 카카오맵 SDK가 완전히 로드되었는지 확인
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.LatLng) {
        console.error('카카오맵 SDK가 완전히 로드되지 않았습니다.');
        setLoadError('카카오맵 SDK가 완전히 로드되지 않았습니다.');
        return;
      }

      // 지도 생성
      const centerLat = filteredSchools.length > 0 
        ? filteredSchools.reduce((sum, school) => sum + school.data.lat, 0) / filteredSchools.length 
        : 37.5665;
      
      const centerLng = filteredSchools.length > 0 
        ? filteredSchools.reduce((sum, school) => sum + school.data.lon, 0) / filteredSchools.length 
        : 126.9780;

      const options = {
        center: new window.kakao.maps.LatLng(centerLat, centerLng),
        level: 3
      };

      const map = new window.kakao.maps.Map(mapRef.current, options);
      mapInstanceRef.current = map;

      // 기존 마커 제거
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // 인포윈도우 생성
      const infoWindow = new window.kakao.maps.InfoWindow({
        zIndex: 1
      } as any);
      infoWindowRef.current = infoWindow;

      // 마커 생성
      filteredSchools.forEach(school => {
        const position = new window.kakao.maps.LatLng(school.data.lat, school.data.lon);
        
        let markerImageSrc = '/marker/marker_yellow.png';
        if (school.data.team === '1팀') {
          markerImageSrc = '/marker/marker_red.png';
        } else if (school.data.team === '2팀') {
          markerImageSrc = '/marker/marker_blue.png';
        } else if (school.data.team === '3팀') {
          markerImageSrc = '/marker/marker_green.png';
        }

        const imageSrc = markerImageSrc;
        const imageSize = new window.kakao.maps.Size(24, 35);
        const imageOption = { offset: new window.kakao.maps.Point(12, 35) };
        const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

        const marker = new window.kakao.maps.Marker({
          position: position,
          image: markerImage
        } as any);

        marker.setMap(map);
        markersRef.current.push(marker);

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, 'click', function() {
          const content = `
            <div style="padding:10px;">
              <h4 style="margin:0 0 5px 0">${school.data.name}</h4>
              <p style="margin:0 0 5px 0">주소: ${school.data.address}</p>
              <p style="margin:0 0 5px 0">전화: ${school.data.teachers_room_num}</p>
              <p style="margin:0 0 5px 0">담당자: ${school.data.admin_room_num}</p>
              <p style="margin:0 0 5px 0">팀: ${school.data.team}</p>
            </div>
          `;
          
          (infoWindow as any).setContent(content);
          (infoWindow as any).open(map, marker);
          onSchoolSelect(school);
        });
      });
    } catch (error) {
      console.error('카카오맵 초기화 오류:', error);
      setLoadError(`카카오맵 초기화 오류: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [isMapLoaded, filteredSchools, onSchoolSelect]);

  if (loadError) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-gray-100">
        <div className="text-center p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold text-red-600 mb-2">지도 로드 오류</h3>
          <p className="text-gray-700">{loadError}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              setLoadError(null);
              setIsMapLoaded(false);
              setIsInitializing(false);
              scriptLoadedRef.current = false;
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px]">
      <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
} 
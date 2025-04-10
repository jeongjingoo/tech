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

const KakaoMap = ({ schools, filter, onSchoolSelect }: KakaoMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  // 필터링된 학교만 표시
  const filteredSchools = schools.filter(school => 
    filter === 'all' || school.data.team === filter
  );

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      const container = mapRef.current;
      if (!container) return;

      const options = {
        center: new window.kakao.maps.LatLng(33.450701, 126.570667),
        level: 3
      };

      const map = new window.kakao.maps.Map(container, options);

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

        const imageSize = new window.kakao.maps.Size(24, 35);
        const imageOption = { offset: new window.kakao.maps.Point(12, 35) };
        const markerImage = new window.kakao.maps.MarkerImage(markerImageSrc, imageSize, imageOption);

        const marker = new window.kakao.maps.Marker({
          position: position,
          image: markerImage
        });

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
          
          const infoWindow = new window.kakao.maps.InfoWindow({
            content: content,
            zIndex: 1
          });
          
          infoWindow.open(map, marker);
          infoWindowRef.current = infoWindow;
          onSchoolSelect(school);
        });
      });

      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = false;
    script.defer = false;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = mapRef.current;
        if (!container) return;

        const options = {
          center: new window.kakao.maps.LatLng(33.450701, 126.570667),
          level: 3
        };

        const map = new window.kakao.maps.Map(container, options);

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

          const imageSize = new window.kakao.maps.Size(24, 35);
          const imageOption = { offset: new window.kakao.maps.Point(12, 35) };
          const markerImage = new window.kakao.maps.MarkerImage(markerImageSrc, imageSize, imageOption);

          const marker = new window.kakao.maps.Marker({
            position: position,
            image: markerImage
          });

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
            
            const infoWindow = new window.kakao.maps.InfoWindow({
              content: content,
              zIndex: 1
            });
            
            infoWindow.open(map, marker);
            infoWindowRef.current = infoWindow;
            onSchoolSelect(school);
          });
        });

        setIsLoaded(true);
      });
    };

    return () => {
      script.remove();
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
    };
  }, [filteredSchools]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px]">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default KakaoMap; 
'use client';

import { useEffect, useRef, useState } from 'react';
import { School } from '../types/school';

// @ts-ignore
declare const kakao: any;

interface KakaoMapProps {
  schools: School[];
  filter: string;
  onSchoolSelect: (school: School) => void;
}

export default function KakaoMap({ schools, filter, onSchoolSelect }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current || !kakao.maps) return;

      const container = mapRef.current;
      const options = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 3,
      };

      const map = new kakao.maps.Map(container, options);
      const markers: any[] = [];
      const bounds = new kakao.maps.LatLngBounds();

      // 기존 마커 제거
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      schools.forEach((school) => {
        const position = new kakao.maps.LatLng(school.data.lat, school.data.lon);
        bounds.extend(position);

        let markerImageSrc = '/marker/marker_yellow.png';
        if (school.data.team === '1팀') {
          markerImageSrc = '/marker/marker_red.png';
        } else if (school.data.team === '2팀') {
          markerImageSrc = '/marker/marker_blue.png';
        } else if (school.data.team === '3팀') {
          markerImageSrc = '/marker/marker_green.png';
        }

        const markerImage = new kakao.maps.MarkerImage(
          markerImageSrc,
          new kakao.maps.Size(24, 35)
        );

        const marker = new kakao.maps.Marker({
          position,
          image: markerImage,
        });

        marker.setMap(map);
        markers.push(marker);

        kakao.maps.event.addListener(marker, 'click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }

          const content = `
            <div style="padding:10px;">
              <h4 style="margin:0 0 5px 0;">${school.data.name}</h4>
              <p style="margin:0 0 5px 0;">주소: ${school.data.address}</p>
              <p style="margin:0 0 5px 0;">전화: ${school.data.teachers_room_num}</p>
              <p style="margin:0 0 5px 0;">담당자: ${school.data.admin_room_num}</p>
              <p style="margin:0 0 5px 0;">팀: ${school.data.team}</p>
            </div>
          `;

          const infoWindow = new kakao.maps.InfoWindow({
            content,
            position,
          });

          infoWindow.open(map, marker);
          infoWindowRef.current = infoWindow;
          onSchoolSelect(school);
        });
      });

      map.setBounds(bounds);
      markersRef.current = markers;
      setMapLoaded(true);
    };

    // 카카오맵 API가 로드되었는지 확인
    if (typeof kakao !== 'undefined' && kakao.maps) {
      initializeMap();
    } else {
      // 스크립트가 아직 로드되지 않은 경우를 대비
      const checkKakaoLoaded = setInterval(() => {
        if (typeof kakao !== 'undefined' && kakao.maps) {
          clearInterval(checkKakaoLoaded);
          initializeMap();
        }
      }, 100);
      
      return () => clearInterval(checkKakaoLoaded);
    }
  }, [schools, filter]);

  return (
    <div className="w-full h-full min-h-[500px]">
      <div ref={mapRef} className="w-full h-full"></div>
    </div>
  );
} 
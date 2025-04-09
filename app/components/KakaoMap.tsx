'use client';

import { useEffect, useRef } from 'react';
import { School } from '../types/school';
import { Map, Marker, useMap } from 'react-kakao-maps-sdk';
import useKakaoLoader from '../hooks/useKakaoLoader';

// @ts-ignore
declare const kakao: any;

interface KakaoMapProps {
  schools: School[];
  filter: string;
  onSchoolSelect: (school: School) => void;
}

function Markers({ schools, filter, onSchoolSelect }: KakaoMapProps) {
  const map = useMap();
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new kakao.maps.LatLngBounds();

    schools.forEach((school) => {
      if (filter !== 'all' && school.data.team !== filter) return;

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
      markersRef.current.push(marker);

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
  }, [map, schools, filter, onSchoolSelect]);

  return null;
}

export default function KakaoMap({ schools, filter, onSchoolSelect }: KakaoMapProps) {
  useKakaoLoader();

  return (
    <div className="w-full h-full min-h-[500px]">
      <Map
        center={{ lat: 37.5665, lng: 126.9780 }}
        style={{ width: "100%", height: "100%" }}
        level={3}
      >
        <Markers
          schools={schools}
          filter={filter}
          onSchoolSelect={onSchoolSelect}
        />
      </Map>
    </div>
  );
} 
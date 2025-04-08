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
    const script = document.createElement('script');

    console.log("map key: " + process.env.NEXT_PUBLIC_KAKAO_MAP_KEY);
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=d1ce32415b1038008e9c94dee00914bc&autoload=false`;
    script.async = true;

    script.onload = () => {
      kakao.maps.load(() => {
        if (!mapRef.current) return;

        const container = mapRef.current;
        const options = {
          center: new kakao.maps.LatLng(37.5665, 126.9780),
          level: 3,
        };

        const map = new kakao.maps.Map(container, options);
        const markers: any[] = [];
        const bounds = new kakao.maps.LatLngBounds();

        schools.forEach((school) => {
          const position = new kakao.maps.LatLng(school.lat, school.lon);
          bounds.extend(position);

          let markerImageSrc = '/marker/marker_yellow.png';
          if (school.team === '1팀') {
            markerImageSrc = '/marker/marker_red.png';
          } else if (school.team === '2팀') {
            markerImageSrc = '/marker/marker_blue.png';
          } else if (school.team === '3팀') {
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
                <h4 style="margin:0 0 5px 0;">${school.school_name}</h4>
                <p style="margin:0 0 5px 0;">주소: ${school.address}</p>
                <p style="margin:0 0 5px 0;">전화: ${school.phone}</p>
                <p style="margin:0 0 5px 0;">담당자: ${school.stuff}</p>
                <p style="margin:0 0 5px 0;">팀: ${school.team}</p>
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
      });
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [schools, onSchoolSelect]);

  useEffect(() => {
    if (!mapLoaded) return;

    markersRef.current.forEach((marker) => {
      const school = schools.find((s) => 
        s.lat === marker.getPosition().getLat() && 
        s.lon === marker.getPosition().getLng()
      );

      if (school) {
        if (filter === 'all' || school.team === filter) {
          marker.setMap(mapRef.current ? new kakao.maps.Map(mapRef.current) : null);
        } else {
          marker.setMap(null);
        }
      }
    });
  }, [filter, schools, mapLoaded]);

  return (
    <div className="relative w-full h-[600px]">
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="text-lg text-gray-600">지도 로딩 중...</div>
        </div>
      )}
    </div>
  );
} 
'use client';

import { Map, MapMarker, MapInfoWindow, useKakaoLoader } from 'react-kakao-maps-sdk';
import { School } from '../types/school';
import { useState } from 'react';

interface KakaoMapProps {
  schools: School[];
  filter: string;
  onSchoolSelect: (school: School) => void;
}

const KakaoMap = ({ schools, filter, onSchoolSelect }: KakaoMapProps) => {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || '',
    libraries: ['services', 'clusterer']
  });

  const [selectedMarker, setSelectedMarker] = useState<School | null>(null);

  const filteredSchools = filter === 'all' 
    ? schools 
    : schools.filter(school => school.data.team === filter);

  // 팀별 마커 이미지 설정
  const getMarkerImage = (team: string) => {
    switch (team) {
      case '1팀':
        return '/markers/marker_blue.png';
      case '2팀':
        return '/markers/marker_red.png';
      case '3팀':
        return '/markers/marker_green.png';
      default:
        return '/markers/marker_default.png';
    }
  };

  const handleMarkerClick = (school: School) => {
    setSelectedMarker(school);
    onSchoolSelect(school);
  };

  if (error) {
    return <div>카카오맵 로드 중 오류가 발생했습니다.</div>;
  }

  return (
    <Map 
      center={{ lat: 35.8242, lng: 127.1479 }} 
      style={{ width: '100%', height: '100%' }}
      level={8}
      onClick={() => setSelectedMarker(null)}
    >
      {filteredSchools.map((school, index) => (
        school.data.lat && school.data.lon && (
          <MapMarker
            key={index}
            position={{ lat: school.data.lat, lng: school.data.lon }}
            onClick={() => handleMarkerClick(school)}
            image={{
              src: getMarkerImage(school.data.team),
              size: { width: 56, height: 56 },
              options: {
                offset: { x: 12, y: 35 }
              }
            }}
          />
        )
      ))}
      {selectedMarker && selectedMarker.data.lat && selectedMarker.data.lon && (
        <MapInfoWindow 
          position={{ lat: selectedMarker.data.lat, lng: selectedMarker.data.lon }}
        >
          <div style={{ padding: '5px', fontSize: '12px', color: 'black', width: '200px' , height: '150px' }}>
            <div style={{ fontWeight: 'bold' }}>{selectedMarker.data.name}</div>
            <br />
            주소: {selectedMarker.data.address}
            <br />
            교무실: {selectedMarker.data.teachers_room_num}
            <br />
            행정실: {selectedMarker.data.admin_room_num}
            <br />
            팀: {selectedMarker.data.team}           
          </div>
        </MapInfoWindow>
      )}
    </Map>
  );
};

export default KakaoMap;
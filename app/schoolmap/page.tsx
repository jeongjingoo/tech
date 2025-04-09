'use client';

import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import Image from 'next/image';
import KakaoMap from '../components/KakaoMap';
import { School } from '../types/school';

// @ts-ignore
declare const kakao: any;
let map: any;
let activeInfoWindow: any;

export default function SchoolMap() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [map, setMap] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const [kakaoLoaded, setKakaoLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=d1ce32415b1038008e9c94dee00914bc&autoload=false`;
    script.async = true;

    script.onload = () => {
      kakao.maps.load(() => {
        setKakaoLoaded(true);
      });
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  useEffect(() => {
    if (kakaoLoaded && mapRef.current) {
      initializeMap();
    }
  }, [kakaoLoaded]);

  const initializeMap = () => {
    if (!mapRef.current || !kakao.maps) return;
    
    const options = {
      center: new kakao.maps.LatLng(37.5665, 126.9780),
      level: 3,
    };
    const newMap = new kakao.maps.Map(mapRef.current, options);
    setMap(newMap);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/schools/all');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '데이터를 불러오는데 실패했습니다.');
      }
      
      if (!result.data || !Array.isArray(result.data)) {
        console.log('데이터가 없거나 배열이 아닙니다.');
        setSchools([]);
        return;
      }
      
      setSchools(result.data);
      if (map) {
        createMarkers(result.data);
      }
    } catch (error) {
      console.error('학교 데이터 조회 오류:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    if (map) {
      markersRef.current.forEach(marker => {
        const school = marker.school;
        if (newFilter === 'all') {
          marker.setMap(map);
        } else if (newFilter === '1팀' && school.data.team === '1팀') {
          marker.setMap(map);
        } else if (newFilter === '2팀' && school.data.team === '2팀') {
          marker.setMap(map);
        } else if (newFilter === '3팀' && school.data.team === '3팀') {
          marker.setMap(map);
        } else {
          marker.setMap(null);
        }
      });
    }
  };

  const createMarkers = (schools: School[]) => {
    if (!map || !kakao.maps) {
      console.log('Map is not initialized yet or kakao.maps is not available');
      return;
    }

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new kakao.maps.LatLngBounds();

    schools.forEach((school) => {
      const position = new kakao.maps.LatLng(school.data.lat, school.data.lon);
      bounds.extend(position);

      let markerImageSrc = '/markers/marker_yellow.png';
      if (school.data.team === '1팀') {
        markerImageSrc = '/markers/marker_red.png';
      } else if (school.data.team === '2팀') {
        markerImageSrc = '/markers/marker_blue.png';
      } else if (school.data.team === '3팀') {
        markerImageSrc = '/markers/marker_green.png';
      }

      const markerImage = new kakao.maps.MarkerImage(
        markerImageSrc,
        new kakao.maps.Size(45, 48),
        {
          offset: new kakao.maps.Point(19, 48)
        }
      );

      const marker = new kakao.maps.Marker({
        position,
        image: markerImage,
      });

      // 마커에 학교 정보 저장
      marker.school = school;

      marker.setMap(map);
      markersRef.current.push(marker);

      kakao.maps.event.addListener(marker, 'click', () => {
        if (activeInfoWindow) {
          activeInfoWindow.close();
        }

        const content = `
          <div style="padding:10px;color:black;min-height:200px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <h4 style="margin:0;">${school.data.name}</h4>               
            </div>
            <p style="margin:0 0 5px 0;">주소: ${school.data.address}</p>
            <p style="margin:0 0 5px 0;">교무실: ${school.data.teachers_room_num}</p>
            <p style="margin:0 0 5px 0;">행정실: ${school.data.admin_room_num}</p>
            <p style="margin:0 0 5px 0;">팀: ${school.data.team}</p>
          </div>
        `;

        const infoWindow = new kakao.maps.InfoWindow({
          content,
          position,
          removable: true
        });

        infoWindow.open(map, marker);
        activeInfoWindow = infoWindow;
      });
    });

    console.log('Setting map bounds');
    map.setBounds(bounds);
  };

  useEffect(() => {
    if (map && schools.length > 0) {
      console.log('Map and schools are ready, creating markers');
      createMarkers(schools);
    }
  }, [map, schools]);

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/edulogo.png"
            alt="교육 로고"
            width={40}
            height={40}
            className="mr-3"
          />
          <h1 className="text-2xl font-semibold text-gray-900">학교 지도</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            전체 ({schools.length})
          </button>
          <button
            onClick={() => handleFilterChange('1팀')}
            className={`px-4 py-2 rounded-md ${
              filter === '1팀'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            1팀 ({schools.filter(school => school.data.team === '1팀').length})
          </button>
          <button
            onClick={() => handleFilterChange('2팀')}
            className={`px-4 py-2 rounded-md ${
              filter === '2팀'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            2팀 ({schools.filter(school => school.data.team === '2팀').length})
          </button>
          <button
            onClick={() => handleFilterChange('3팀')}
            className={`px-4 py-2 rounded-md ${
              filter === '3팀'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            3팀 ({schools.filter(school => school.data.team === '3팀').length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : (
          <div className="h-[600px]">
            <div ref={mapRef} className="w-full h-full"></div>
          </div>
        )}
      </div>

      {selectedSchool && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{selectedSchool.data.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">주소</p>
              <p className="font-medium">{selectedSchool.data.address}</p>
            </div>
            <div>
              <p className="text-gray-600">교무실</p>
              <p className="font-medium">{selectedSchool.data.teachers_room_num}</p>
            </div>
            <div>
              <p className="text-gray-600">행정실</p>
              <p className="font-medium">{selectedSchool.data.admin_room_num}</p>
            </div>
            <div>
              <p className="text-gray-600">팀</p>
              <p className="font-medium">{selectedSchool.data.team}</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 

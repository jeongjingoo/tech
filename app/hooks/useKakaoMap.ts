import { useEffect, useRef, useState } from 'react';

interface KakaoMapOptions {
  center: {
    lat: number;
    lng: number;
  };
  level: number;
}

interface KakaoMapHookResult {
  map: any | null;
  markers: any[];
  setMarkers: (markers: any[]) => void;
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function useKakaoMap(options: KakaoMapOptions): KakaoMapHookResult {
  const [map, setMap] = useState<any | null>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 카카오맵 스크립트 로드
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapContainerRef.current) return;

        const mapOptions = {
          center: new window.kakao.maps.LatLng(options.center.lat, options.center.lng),
          level: options.level,
        };

        const kakaoMap = new window.kakao.maps.Map(mapContainerRef.current, mapOptions);
        setMap(kakaoMap);
      });
    };

    return () => {
      // 컴포넌트 언마운트 시 마커 제거
      markers.forEach((marker) => {
        if (marker && typeof marker.setMap === 'function') {
          marker.setMap(null);
        }
      });
      document.head.removeChild(script);
    };
  }, []);

  return { map, markers, setMarkers, mapContainerRef };
} 
import Script from 'next/script';
import { Map } from 'react-kakao-maps-sdk';

const KAKAO_MAP_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;

const KakaoMap = () => {
  return (
    <div>
      <Script src={KAKAO_MAP_URL} strategy='beforeInteractive'/>
      <Map center={{lat: 37.497930, lng: 127.027596 }}
        style={{ width: '100%', height: '100%' }}></Map>
    </div>
  );
};

export default KakaoMap;
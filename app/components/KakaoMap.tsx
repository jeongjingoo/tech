import Script from 'next/script';
import { Map } from 'react-kakao-maps-sdk';

const KAKAO_MAP_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=d1ce32415b1038008e9c94dee00914bc&autoload=false`;

const KakaoMap = () => {
  return (
    <div>
      <Script src={KAKAO_MAP_URL} strategy='beforeInteractive'/>
      <Map center={{lat: 37.497930, lng: 127.027596 }}
        style={{ width: '700px', height: '500px' }}></Map>
    </div>
  );
};

export default KakaoMap;
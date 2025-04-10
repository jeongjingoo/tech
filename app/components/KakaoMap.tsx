import Script from 'next/script';
import { Map } from 'react-kakao-maps-sdk';

const KAKAO_MAP_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=43b01fe8fe52caf6f21bc19d256eca8&autoload=false`;

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
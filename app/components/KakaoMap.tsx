import Script from 'next/script';
const KAKAO_MAP_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=43b01fe8fe52caf6f21bc19d256eca8&autoload=false`;

const KakaoMap = () => {
  return (
    <div>
      <Script src={KAKAO_MAP_URL} strategy='beforeInteractive'/>
    </div>
  );
};

export default KakaoMap;
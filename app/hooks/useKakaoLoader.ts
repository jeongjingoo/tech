import { useKakaoLoader as useKakaoLoaderOrigin } from "react-kakao-maps-sdk"

export default function useKakaoLoader() {
  useKakaoLoaderOrigin({
    appkey: "d1ce32415b1038008e9c94dee00914bc",
    libraries: ["clusterer", "services"],
  })
} 
'use client';

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNetworkSpeedTest } from '@rtbjs/network-speed-test';

interface WifiInfo {
  elapsedTime: number;
  downloadSpeed: number;
  uploadSpeed: number;
}

const WifiInfo = () => {
  const [wifiInfo, setWifiInfo] = useState<WifiInfo>({
    elapsedTime: 0,
    downloadSpeed: 0,
    uploadSpeed: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { runTest, download, upload, isRunning, isComplete } = useNetworkSpeedTest();

  // 테스트 진행 상태 모니터링 및 결과 업데이트
  useEffect(() => {
    if (isRunning) {
      setIsLoading(true);
    } else if (isComplete) {
      setIsLoading(false);
      
      // 테스트 완료 시 결과 업데이트
      const elapsedTime = Number((download.result.elapsedTime || 0).toFixed(2));
      const downloadSpeed = download.result.meanClientMbps || 0;
      const uploadSpeed = upload.result.meanClientMbps || 0;

      setWifiInfo({
        elapsedTime,
        downloadSpeed,
        uploadSpeed
      });
    }
  }, [isRunning, isComplete, download.result, upload.result]);

  const measureNetworkSpeed = async () => {
    setIsLoading(true);
    try {
      // 속도 테스트 실행
      runTest();
      
      // 테스트 완료 대기
      await new Promise(resolve => {
        const checkComplete = () => {
          if (isComplete) {
            resolve(true);
          } else {
            setTimeout(checkComplete, 500);
          }
        };
        checkComplete();
      });
    } catch (error) {
      console.error('WiFi 정보를 가져오는데 실패했습니다:', error);
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-black">WiFi 정보</h2>
        <div className="space-y-2">          
          <div className="flex justify-between">
            <span className="text-gray-600">측정 시간:</span>
            <span className="font-medium text-black">{wifiInfo.elapsedTime} ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">다운로드 속도:</span>
            <span className="font-medium text-black">{wifiInfo.downloadSpeed.toFixed(2)} Mbps</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">업로드 속도:</span>
            <span className="font-medium text-black">{wifiInfo.uploadSpeed.toFixed(2)} Mbps</span>
          </div>
        </div>
        <div className='flex justify-center mt-4'>
          <button 
            className={`px-4 py-2 rounded-md ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            onClick={measureNetworkSpeed}
            disabled={isLoading}
          >
            {isLoading ? '측정 중...' : '측정하기'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default WifiInfo; 
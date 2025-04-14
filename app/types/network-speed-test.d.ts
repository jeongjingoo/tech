declare module 'network-speed-test' {
  export class NetworkSpeedTest {
    checkDownloadSpeed(): Promise<number>;
    checkUploadSpeed(): Promise<number>;
  }
} 
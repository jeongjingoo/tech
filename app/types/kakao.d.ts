declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: MapOptions) => Map;
        LatLng: new (lat: number, lng: number) => LatLng;
        LatLngBounds: new () => LatLngBounds;
        Marker: new (options: MarkerOptions) => Marker;
        MarkerImage: new (src: string, size: Size, options?: any) => MarkerImage;
        InfoWindow: new (options: InfoWindowOptions) => InfoWindow;
        Size: new (width: number, height: number) => Size;
        event: {
          addListener: (target: any, eventName: string, callback: () => void) => void;
        };
      };
    };
    closeInfoWindow: () => void;
  }
}

interface MapOptions {
  center: LatLng;
  level: number;
}

interface Map {
  setBounds: (bounds: LatLngBounds) => void;
}

interface LatLng {
  getLat: () => number;
  getLng: () => number;
}

interface LatLngBounds {
  extend: (latlng: LatLng) => void;
}

interface MarkerOptions {
  position: LatLng;
  image?: MarkerImage;
}

interface Marker {
  setMap: (map: Map | null) => void;
  getPosition: () => LatLng;
}

interface MarkerImage {}

interface InfoWindowOptions {
  content: string;
  position: LatLng;
}

interface InfoWindow {
  open: (map: Map, marker: Marker) => void;
  close: () => void;
}

interface Size {} 
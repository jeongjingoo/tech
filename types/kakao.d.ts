declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: MapOptions) => Map;
        LatLng: new (lat: number, lng: number) => LatLng;
        Marker: new (options: MarkerOptions) => Marker;
        InfoWindow: new (options: InfoWindowOptions) => InfoWindow;
        event: {
          addListener: (target: any, type: string, handler: () => void) => void;
        };
      };
    };
  }
}

export interface MapOptions {
  center: LatLng;
  level: number;
}

export interface Map {
  setCenter: (latlng: LatLng) => void;
  setLevel: (level: number) => void;
}

export interface LatLng {
  getLat: () => number;
  getLng: () => number;
}

export interface MarkerOptions {
  position: LatLng;
  map: Map;
}

export interface Marker {
  setMap: (map: Map | null) => void;
}

export interface InfoWindowOptions {
  content: string;
}

export interface InfoWindow {
  open: (map: Map, marker: Marker) => void;
}

export {}; 
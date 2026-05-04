declare namespace kakao.maps {
  export class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    setLevel(level: number): void;
    getCenter(): LatLng;
    getLevel(): number;
    relayout(): void;
  }

  export interface MapOptions {
    center: LatLng;
    level?: number;
    mapTypeId?: MapTypeId;
  }

  export class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  export enum MapTypeId {
    ROADMAP,
    SKYVIEW,
    HYBRID
  }

  export namespace event {
    export function addListener(target: any, type: string, callback: (...args: any[]) => void): void;
    export interface MouseEvent {
      latLng: LatLng;
      point: Point;
    }
  }

  export class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(position: LatLng): void;
  }

  export interface MarkerOptions {
    map?: Map;
    position: LatLng;
    image?: MarkerImage;
    title?: string;
    draggable?: boolean;
    zIndex?: number;
  }

  export namespace services {
    export enum Status {
      OK,
      ZERO_RESULT,
      ERROR
    }

    export class Places {
      keywordSearch(keyword: string, callback: (result: any[], status: Status, pagination: any) => void, options?: any): void;
    }

    export class Geocoder {
      coord2Address(x: number, y: number, callback: (result: any[], status: Status) => void, options?: any): void;
    }
  }
}

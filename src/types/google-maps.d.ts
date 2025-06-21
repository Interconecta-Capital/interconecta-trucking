
declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        MapTypeId: {
          ROADMAP: string;
          SATELLITE: string;
          HYBRID: string;
          TERRAIN: string;
        };
        Marker: any;
        InfoWindow: any;
        LatLng: any;
        LatLngBounds: any;
        DirectionsService: any;
        TravelMode: {
          DRIVING: string;
          WALKING: string;
          BICYCLING: string;
          TRANSIT: string;
        };
        UnitSystem: {
          METRIC: number;
          IMPERIAL: number;
        };
        Polyline: any;
        NavigationControl: any;
        Size: any;
        Animation: {
          DROP: any;
          BOUNCE: any;
        };
        ControlPosition: {
          TOP_CENTER: number;
          TOP_LEFT: number;
          TOP_RIGHT: number;
          BOTTOM_CENTER: number;
          BOTTOM_LEFT: number;
          BOTTOM_RIGHT: number;
        };
        MapTypeControlStyle: {
          DEFAULT: number;
          HORIZONTAL_BAR: number;
          DROPDOWN_MENU: number;
        };
        geometry: {
          encoding: {
            decodePath: (encodedPath: string) => any[];
          };
        };
        event: {
          addListener: (instance: any, eventName: string, handler: Function) => any;
          addListenerOnce: (instance: any, eventName: string, handler: Function) => any;
        };
      };
    };
  }
}

export {};

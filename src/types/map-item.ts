import { DbPosition } from './db-position';
import { DbItem } from './db-item';


export interface MapItem {
  id: string;
  doc: {
    template: string;
    identifier: string;
    properties: {
      icon: string;
      color: string;
      name: string;
    };
  };
  positions: {
    doc: {
      timestamp: string;
      heading: number;
      lat: number;
      lon: number;
    };
  }[];
}

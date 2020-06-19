import { DbPosition } from './db-position';
import { DbItem } from './db-item';

export interface MapItem {
  id: string;
  // doc: DbItem;  // actually, we might want to allow doc to diverge from DbItem.
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
    doc: DbPosition;
  }[];
}

export interface DbPosition {
  _id: string;
  _rev: string;
  lat: number;
  lon: number;
  altitude: number;
  heading: number;
  speed: number;
  item_identifier: string;
  source: string;
  timestamp: string;
}

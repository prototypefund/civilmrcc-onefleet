export interface DbPosition {
  _id: string; // item_identifier + '_' + timestamp (isotime)
  _rev: string;
  lat: number;
  lon: number;
  altitude: number;
  heading: number;
  speed: number;
  item_identifier: string; // must never change. Rather copy & soft-delete a position.
  source: string;
  timestamp: string; // must never change. Rather copy & soft-delete a position.
  soft_deleted?: boolean; // invalid positions should never be deleted by the frontend app, only maked as "soft_deleted"
}

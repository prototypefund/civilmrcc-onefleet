/**
 * Object of OneFleet SAR Zone
 */
export interface SARZone {
  /** The name of the specific SAR zone matching to the coordinates */
  name: string;
  /** The color of the SAR zone */
  color: string;
  coordinates: SARCoordinates;
}

/**
 * Array of LatLng coordinates which describes a polygon of the SAR zone bounds
 */
export type SARCoordinates = [number, number][];

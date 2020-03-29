/**
 * SAR-Zone coordinates in LatLng format
 * If you need to convert some position data, here is a tool: https://www.pgc.umn.edu/apps/convert/
 */

const LybianSarZoneCoordinates: SARCoordinates = [
  [32.366667, 11.5],
  [34.333333, 11.5],
  [34.333333, 23.583333],
  [34, 24.166667],
  [31.1666, 25.1666],
  [30.266667, 19.083333],
];

const MalteseSarZoneCoordinates: SARCoordinates = [
  [36.5, 19.0],
  [36.5, 11.5],
  [34.3333, 11.5],
  [34.3333, 23.5833],
];

const TunesianSarZoneCoordinates: SARCoordinates = [
  [32.366667, 11.5],
  [37.5, 11.5],
  [38, 10.35],
  [38, 8.608833],
  [36.921352, 8.643117],
  [33.874256, 10.046597],
  [32.366667, 11.5],
];

/** Italien SAR-Zone is splitted into three sepaerate zones of italien regions. Palermo, Catania & Calabria. */
const PalermoSarZoneCoordinates: SARCoordinates = [
  [38.02, 14.18],
  [38.183333, 14.1],
  [39.2, 14.1],
  [39.85, 11.65],
  [38, 10.35],
  [37.5, 11.5],
  [36.5, 11.5],
  [35.25, 12.233333],
  [35.25, 12.666667],
  [36.5, 14.133333],
  [36.666667, 14.133333],
  [37.003333, 14.338333],
  [38.02, 14.18],
];

const CataniaSarZoneCoordinates: SARCoordinates = [
  [38.02, 14.18],
  [38.183333, 14.1],
  [39.2, 14.1],
  [39.016667, 14.816667],
  [39.016667, 15.583333],
  [38.666667, 15.516667],
  [38.65, 15.483333],
  [38.3, 15.485],
  [38.3, 15.541667],
  [38.016667, 15.441667],
  [38.016667, 15.558333],
  [37.75, 15.55],
  [36.0, 19.0],
  [36.0, 16.0],
  [36.5, 14.133333],
  [36.666667, 14.133333],
  [37.003333, 14.338333],
  [38.02, 14.18],
];

const CalabriaSarZoneCoordinates: SARCoordinates = [
  [40.043333, 15.643333],
  [39.833333, 15.5],
  [39.016667, 14.816667],
  [39.016667, 15.583333],
  [38.666667, 15.516667],
  [38.65, 15.483333],
  [38.3, 15.651667],
  [38.3, 15.816667],
  [38.016667, 15.641667],
  [38.016667, 15.558333],
  [37.75, 15.55],
  [36.0, 19.0],
  [39.0, 19.0],
  [39.416667, 17.866667],
  [39.6, 17.766667],
  [39.783333, 17.35],
  [40.115, 16.636667],
  [40.043333, 15.643333],
];

export const SARZones: SARZone[] = [
  { coordinates: LybianSarZoneCoordinates, name: 'Lybian', color: '#CC0033' },
  {
    coordinates: TunesianSarZoneCoordinates,
    name: 'Tunesian',
    color: '#FFC414',
  },
  { coordinates: MalteseSarZoneCoordinates, name: 'Maltese', color: '#00875A' },
  /** Italien */
  { coordinates: PalermoSarZoneCoordinates, name: 'Palermo', color: '#005EB8' },
  {
    coordinates: CalabriaSarZoneCoordinates,
    name: 'Calabria',
    color: '#0066CC',
  },
  { coordinates: CataniaSarZoneCoordinates, name: 'Catania', color: '#003F83' },
];

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

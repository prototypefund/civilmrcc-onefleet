import mapWrapper from '../utils/mapWrapper';

export interface ReplayOptions {
  startDate: string;
  endDate: string;
  frameLength: number;
  hoursPerFrame: number;
  map: typeof mapWrapper;
  // Todo: Infer this type from vue
  shown_items: unknown[];
}

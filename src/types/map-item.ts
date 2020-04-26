export interface MapItem {
  id: string;
  doc: {
    template: string;
    identifier: string;
    base_template: string;
    properties: {
      icon: string;
      color: string;
      boat_color: string;
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

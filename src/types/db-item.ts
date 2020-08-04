export interface DbItem {
  _id: string;
  _rev: string;
  identifier: string;
  template: string;
  properties: Object;
  vehicles: unknown[];
  template_data: string;
  form_data: {
    properties: {};
  };
  position_data: {
    positions: [{}];
  };
}

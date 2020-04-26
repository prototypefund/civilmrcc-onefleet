export interface DbItem {
  template: string;
  vehicles: unknown[];
  template_data: string;
  form_data: {
    properties: {};
  };
  position_data: {
    positions: [{}];
  };
}

export interface ItemTemplate {
  _id: string;
  plural: string;
  pouch_identifier: string;
  add_initial_position: boolean;
  type: 'line' | 'area' | 'point'; // remove this? Can be taken from positions/timestamps: multiple positions with equal timestamps are an area, else a track.
  default_marker_icon: string; // the default marker for this type of item
  fields: Array<ItemTemplateField>;
}

export interface ItemTemplateField {
  name: string;
  title: string;
  type: 'number' | 'text' | 'color' | 'select' | 'togglebuttons' | 'boolean';
  options?: Map<string, string>; // a mapping of internal value to UI title for each option
  value: number | string; // maybe rename to "default_value"?
  hidden: boolean;
  tooltip: string;
  field_icon?: string;
}

import { DbItem } from './db-item';

export interface ItemFilterGroup {
  title: string;
  selectable_in_sidebar: boolean;
  selectable_on_map: boolean;
  initially_selected_in_sidebar?: boolean;
  initially_selected_on_map?: boolean;
  filters: Array<ItemFilter>;
  sortings: Array<any>;
}

export interface ItemFilter {
  name: string;
  field: string;
  values: Array<string>;
  initially_active?: boolean;
  always_active?: boolean;
  active?: boolean;
}

export interface FilteredItemSection {
  title: string;
  base_items: Array<DbItem>;
  hidden_items: number;
}

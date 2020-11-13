export interface DbItem {
  _id: string;
  _rev: string;
  identifier: string;
  template: string;
  properties: Map<string, string>;
  soft_deleted?: boolean; // soft-delete of items should only be allowed if a duplicate exists
}

export interface DatabaseFieldDefinition {
  name: string;
  type: FieldType;
}

export enum FieldType {
  String,
  Number,
  Binary,
}

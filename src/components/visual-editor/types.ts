export interface DirtyField {
  docPath: string; // e.g. "settings/homepage" or "settings/aotm"
  field: string;   // e.g. "headerTagline"
  oldValue: any;
  newValue: any;
  label?: string;
  elementId?: string;
}

export interface InspectorHistoryStep {
  dirtyFields: Record<string, DirtyField>;
}

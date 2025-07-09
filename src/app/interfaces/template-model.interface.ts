export interface TemplateModel<T> {
  items: T[];
  total: number;
  loading: boolean;
  error: boolean;
}

import { Observable, of } from 'rxjs';
import { TemplateModel } from '../interfaces/template-model.interface';

export function buildPaginatedRecord<T>(
  items: T[],
  meta: TemplateModel<T>,
  pageSize: number,
): Record<number, Observable<TemplateModel<T>>> {
  const totalPages = Math.ceil(items.length / pageSize);
  const record: Record<number, Observable<TemplateModel<T>>> = {};
  for (let page = 1; page <= totalPages; page++) {
    const start = (page - 1) * pageSize;
    const pageItems = items.slice(start, start + pageSize);
    record[page] = of({
      items: pageItems,
      total: items.length,
      loading: meta.loading,
      error: meta.error,
    });
  }
  if (totalPages === 0) {
    record[1] = of({
      items: [],
      total: 0,
      loading: meta.loading,
      error: meta.error,
    });
  }
  return record;
}

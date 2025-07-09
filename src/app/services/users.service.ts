import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../interfaces/user.interface';
import { catchError, map, merge, Observable, of } from 'rxjs';
import { TemplateModel } from '../interfaces/template-model.interface';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly httpClient = inject(HttpClient);

  private readonly baseUrl = 'https://jsonplaceholder.typicode.com/users';

  fetch(page: number, limit = 2): Observable<TemplateModel<User>> {
    const params = new HttpParams()
      .set('_page', page.toString())
      .set('_limit', limit.toString());
    return merge(
      of({ items: [], loading: true, error: false, total: 0 }),
      this.httpClient
        .get<User[]>(this.baseUrl, { params, observe: 'response' })
        .pipe(
          map((response) => {
            const total = Number(response.headers.get('X-Total-Count'));
            const items = response.body ?? [];
            return { items, loading: false, error: false, total };
          }),
          catchError(() => {
            return of({ items: [], loading: false, error: true, total: 0 });
          }),
        ),
    );
  }
}

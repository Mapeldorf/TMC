import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../interfaces/user.interface';
import { catchError, map, merge, Observable, of } from 'rxjs';
import { TemplateModel } from '../interfaces/template-model.interface';

export interface UsersRequest {
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly httpClient = inject(HttpClient);

  private readonly baseUrl = 'https://jsonplaceholder.typicode.com/users';

  fetch(usersRequest?: UsersRequest): Observable<TemplateModel<User>> {
    const params = usersRequest
      ? new HttpParams()
          .set('_page', usersRequest.page.toString())
          .set('_limit', usersRequest.limit.toString())
      : {};
    return merge(
      of({ items: [], loading: true, error: false, total: 0 }),
      this.httpClient.get<User[]>(this.baseUrl, { params }).pipe(
        map((items) => {
          return { items, loading: false, error: false, total: 10 };
        }),
        catchError(() => {
          return of({ items: [], loading: false, error: true, total: 0 });
        }),
      ),
    );
  }
}

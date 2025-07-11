import { inject, Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../interfaces/user.interface';
import { Observable } from 'rxjs';
import { UsersRequest } from '../interfaces/users-request.interface';

@Injectable({
  providedIn: 'root',
})
export class UsersRepository {
  private readonly baseUrl = 'https://jsonplaceholder.typicode.com/users';

  private readonly httpClient = inject(HttpClient);

  fetch(usersRequest?: UsersRequest): Observable<User[]> {
    const params = usersRequest
      ? new HttpParams()
          .set('_page', usersRequest.page.toString())
          .set('_limit', usersRequest.limit.toString())
      : {};
    return this.httpClient.get<User[]>(this.baseUrl, { params });
  }
}

import { inject, Injectable } from '@angular/core';
import { map, merge, Observable, of } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { TemplateModel } from '../interfaces/template-model.interface';
import { UsersRepository } from '../repositories/users.repository';
import { UsersRequest } from '../interfaces/users-request.interface';

@Injectable({
  providedIn: 'root',
})
export class GetUsersUseCase {
  private readonly repository = inject(UsersRepository);

  // private attempts = 0;

  execute(usersRequest?: UsersRequest): Observable<TemplateModel<User>> {
    return merge(
      of({ items: [], loading: true, error: false, total: 0 }),
      this.repository.fetch(usersRequest).pipe(
        map((items) => {
          return { items, loading: false, error: false, total: 10 };
        }),
        // tap(() => {
        //   this.attempts = this.attempts + 1;
        //   if (this.attempts === 2) {
        //     throw new Error('Error');
        //   }
        // }),
      ),
    );
  }
}

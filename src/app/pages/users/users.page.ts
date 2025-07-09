import { Component, DestroyRef, inject } from '@angular/core';
import { UsersService } from '../../services/users.service';
import {
  BehaviorSubject,
  mergeMap,
  Observable,
  scan,
  shareReplay,
  withLatestFrom,
} from 'rxjs';
import { User } from '../../interfaces/user.interface';
import { TemplateModel } from '../../interfaces/template-model.interface';
import { PaginationComponent } from '../../components/pagination.component';
import { ListComponent } from '../../components/list.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FilterComponent } from '../../components/filter.component';
import { FormValue } from '../../interfaces/form-value.interface';

@Component({
  templateUrl: './users.page.html',
  imports: [PaginationComponent, ListComponent, FilterComponent],
})
export class UsersPage {
  private readonly usersService = inject(UsersService);

  private readonly currentPage = new BehaviorSubject(1);

  private readonly formValue = new BehaviorSubject<FormValue>({
    name: '',
    email: '',
  });

  private readonly destroyRef = inject(DestroyRef);

  private readonly allUsers$: Observable<
    Record<number, Observable<TemplateModel<User>>>
  > = this.currentPage.pipe(
    takeUntilDestroyed(this.destroyRef),
    scan((acc: Record<number, Observable<TemplateModel<User>>>, page) => {
      if (!acc[page]) {
        acc = {
          ...acc,
          [page]: this.usersService
            .fetch(page)
            .pipe(shareReplay({ refCount: true, bufferSize: 1 })),
        };
      }
      return acc;
    }, {}),
  );

  readonly currentPageUsers$ = this.allUsers$.pipe(
    withLatestFrom(this.currentPage),
    takeUntilDestroyed(this.destroyRef),
    mergeMap(([users, page]) => {
      return users[page];
    }),
  );

  readonly currentPageUsers = toSignal(this.currentPageUsers$);

  setCurrentPage(page: number): void {
    this.currentPage.next(page);
  }

  setFormValue(formValue: FormValue): void {
    this.formValue.next(formValue);
  }
}

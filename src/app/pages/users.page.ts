import { Component, computed, DestroyRef, inject } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  merge,
  Observable,
  of,
  scan,
  shareReplay,
  Subject,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { User } from '../interfaces/user.interface';
import { TemplateModel } from '../interfaces/template-model.interface';
import { PaginationComponent } from '../components/pagination.component';
import { ListComponent } from '../components/list.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FilterComponent } from '../components/filter.component';
import { FormValue } from '../interfaces/form-value.interface';
import { GetUsersUseCase } from '../use-cases/get-users.use-case';
import { UsersRequest } from '../interfaces/users-request.interface';
import { NextPageTrigger } from '../interfaces/next-page-trigger.interface';
import { SearchType } from '../enums/search-type.enum';

@Component({
  template: `
    <app-filter (formValue)="setFormValue($event)" />
    <app-pagination
      [type]="selectedPageType()"
      [total]="selectedPageUsersTotal()"
      (selectedPage)="setSelectedPage($event)"
    />
    <app-list [users]="selectedPageUsers()" />
  `,
  imports: [PaginationComponent, ListComponent, FilterComponent],
})
export class UsersPage {
  private readonly getUsersUseCase = inject(GetUsersUseCase);

  private readonly destroyRef = inject(DestroyRef);

  private readonly selectedPageSubject = new BehaviorSubject<NextPageTrigger>({
    page: 1,
    type: SearchType.WITHOUT_FILTERS,
  });

  private readonly formValueSubject = new Subject<FormValue>();

  private readonly formValue$ = this.formValueSubject.asObservable();

  private readonly selectedPage$ = merge(
    this.selectedPageSubject,
    this.formValue$.pipe(
      map((formValue) => {
        return {
          page: 1,
          type:
            Boolean(formValue.email) || Boolean(formValue.name)
              ? SearchType.WITH_FILTERS
              : SearchType.WITHOUT_FILTERS,
        };
      }),
    ),
  );

  private readonly usersWithoutFilters$ = this.selectedPage$.pipe(
    filter(({ type }) => type === SearchType.WITHOUT_FILTERS),
    takeUntilDestroyed(this.destroyRef),
    scan((acc: Record<number, Observable<TemplateModel<User>>>, { page }) => {
      if (!acc[page]) {
        acc = {
          ...acc,
          [page]: this.getUsers({ page, limit: 2 }),
        };
      }
      return acc;
    }, {}),
  );

  private readonly usersWithFilters$ = combineLatest([
    this.formValue$.pipe(
      filter(
        (formValue) => Boolean(formValue.email) || Boolean(formValue.name),
      ),
    ),
    this.getUsers(),
    this.selectedPage$.pipe(
      filter(({ type }) => type === SearchType.WITH_FILTERS),
    ),
  ]).pipe(
    map(([formValue, users]) => {
      const filteredItems = users.items.filter((user) => {
        return (
          (formValue.email &&
            user.email.toLowerCase().includes(formValue.email.toLowerCase())) ||
          (formValue.name &&
            user.name.toLowerCase().includes(formValue.name.toLowerCase()))
        );
      });
      const pageSize = 2;
      const totalPages = Math.ceil(filteredItems.length / pageSize);
      const usersRecord: Record<number, Observable<TemplateModel<User>>> = {};
      for (let page = 1; page <= totalPages; page++) {
        const start = (page - 1) * pageSize;
        const pageItems = filteredItems.slice(start, start + pageSize);
        usersRecord[page] = of({
          items: pageItems,
          total: filteredItems.length,
          loading: users.loading,
          error: users.error,
        });
      }
      return usersRecord;
    }),
  );

  private readonly allUsers$ = merge(
    this.usersWithoutFilters$,
    this.usersWithFilters$,
  );

  private readonly selectedPageUsers$ = this.allUsers$.pipe(
    withLatestFrom(this.selectedPage$),
    takeUntilDestroyed(this.destroyRef),
    switchMap(([users, selectedPage]) => users[selectedPage.page]),
  );

  readonly selectedPageUsers = toSignal(this.selectedPageUsers$);

  readonly selectedPage = toSignal(this.selectedPage$);

  readonly selectedPageUsersTotal = computed(
    () => this.selectedPageUsers()?.total,
  );

  readonly selectedPageType = computed(() => this.selectedPage()?.type);

  setSelectedPage(page: NextPageTrigger): void {
    this.selectedPageSubject.next(page);
  }

  setFormValue(formValue: FormValue): void {
    this.formValueSubject.next(formValue);
  }

  private getUsers(
    usersRequest?: UsersRequest,
  ): Observable<TemplateModel<User>> {
    const params = usersRequest
      ? { page: usersRequest.page, limit: usersRequest.limit }
      : undefined;
    return this.getUsersUseCase
      .execute(params)
      .pipe(shareReplay({ refCount: true, bufferSize: 1 }));
  }
}

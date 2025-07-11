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
    <main class="p-6 space-y-8 bg-gray-100 min-h-screen">
      <section aria-labelledby="filter-section">
        <h2 id="filter-section" class="sr-only">Filtro de usuarios</h2>
        <app-filter (formValue)="setFormValue($event)" />
      </section>
      <section aria-labelledby="pagination-section">
        <h2 id="pagination-section" class="sr-only">Paginación</h2>
        <app-pagination
          [type]="selectedPageType()"
          [total]="selectedPageUsersTotal()"
          (selectedPage)="setSelectedPage($event)"
        />
      </section>
      <section aria-labelledby="list-section">
        <h2 id="list-section" class="sr-only">Listado de usuarios</h2>
        <app-list [users]="selectedPageUsers()" />
      </section>
    </main>
  `,
  imports: [PaginationComponent, ListComponent, FilterComponent],
})
export class UsersPage {
  private readonly getUsersUseCase = inject(GetUsersUseCase);

  private readonly destroyRef = inject(DestroyRef);

  private readonly formValueSubject = new Subject<FormValue>();

  private readonly formValue$ = this.formValueSubject.asObservable();

  private readonly selectedPageSubject = new BehaviorSubject<NextPageTrigger>({
    page: 1,
    type: SearchType.WITHOUT_FILTERS,
  });

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

  private readonly allUserData$ = this.getUsersUseCase
    .execute()
    .pipe(shareReplay({ refCount: true, bufferSize: 1 }));

  private readonly usersWithoutFilters$ = this.selectedPage$.pipe(
    filter(({ type }) => type === SearchType.WITHOUT_FILTERS),
    takeUntilDestroyed(this.destroyRef),
    scan((acc: Record<number, Observable<TemplateModel<User>>>, { page }) => {
      if (!acc[page]) {
        acc = {
          ...acc,
          [page]: this.getUsersWithoutFilters({ page, limit: 2 }),
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
    this.selectedPage$.pipe(
      filter(({ type }) => type === SearchType.WITH_FILTERS),
      switchMap(() => this.allUserData$),
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
    switchMap(
      ([users, selectedPage]) =>
        users[selectedPage.page] ??
        of({ items: [], loading: false, error: false, total: 0 }),
    ),
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

  private getUsersWithoutFilters({
    page,
    limit,
  }: UsersRequest): Observable<TemplateModel<User>> {
    return this.getUsersUseCase
      .execute({ page, limit })
      .pipe(shareReplay({ refCount: true, bufferSize: 1 }));
  }
}

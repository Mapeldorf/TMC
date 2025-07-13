import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  map,
  merge,
  Observable,
  of,
  scan,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { User } from '../../interfaces/user.interface';
import { TemplateModel } from '../../interfaces/template-model.interface';
import { PaginationComponent } from '../../components/pagination.component';
import { ListComponent } from '../../components/list.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FilterComponent } from '../../components/filter.component';
import { FormValue } from '../../interfaces/form-value.interface';
import { GetUsersUseCase } from '../../use-cases/get-users.use-case';
import { UsersRequest } from '../../interfaces/users-request.interface';
import { NextPageTrigger } from '../../interfaces/next-page-trigger.interface';
import { SearchType } from '../../enums/search-type.enum';
import { UserDetailModalComponent } from '../../components/user-detail-modal.component';

@Component({
  templateUrl: './users.page.html',
  imports: [
    PaginationComponent,
    ListComponent,
    FilterComponent,
    UserDetailModalComponent,
  ],
})
export class UsersPage {
  private readonly getUsersUseCase = inject(GetUsersUseCase);

  private readonly destroyRef = inject(DestroyRef);

  private readonly formValueSubject = new Subject<FormValue>();

  private readonly formValue$ = this.formValueSubject.asObservable();

  private readonly retryUsersWithoutFilters = new Subject<void>();

  private readonly retryUsersWithFilters = new Subject<void>();

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
      tap(() => {
        this.currentIndex.set(0);
      }),
    ),
  );

  readonly currentIndex = signal<number>(0);

  readonly modalOpen = signal(false);

  readonly selectedUser = signal<User | null>(null);

  private readonly allUserData$ = this.getUsersUseCase.execute().pipe(
    takeUntilDestroyed(this.destroyRef),
    shareReplay({ refCount: true, bufferSize: 1 }),
    catchError(() => {
      return of({ items: [], loading: false, error: true, total: 0 });
    }),
  );

  private readonly usersWithoutFilters$ = this.retryUsersWithoutFilters.pipe(
    startWith(null),
    switchMap(() => this.selectedPage$),
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

  private readonly usersWithFilters$ = this.retryUsersWithFilters.pipe(
    startWith(null),
    switchMap(() =>
      combineLatest([
        this.formValue$.pipe(
          filter(
            (formValue) => Boolean(formValue.email) || Boolean(formValue.name),
          ),
        ),
        this.selectedPage$.pipe(
          filter(({ type }) => type === SearchType.WITH_FILTERS),
          switchMap(() => this.allUserData$),
        ),
      ]),
    ),
    map(([formValue, users]) => {
      const filteredItems = this.getFilteredItemsForUsersWithFilters(
        formValue,
        users,
      );
      return this.getUsersRecordForUsersWithFilters(filteredItems, users);
    }),
  );

  private getFilteredItemsForUsersWithFilters(
    formValue: FormValue,
    users: TemplateModel<User>,
  ): User[] {
    return users.items.filter((user) => {
      return (
        (formValue.email &&
          user.email.toLowerCase().includes(formValue.email.toLowerCase())) ||
        (formValue.name &&
          user.name.toLowerCase().includes(formValue.name.toLowerCase()))
      );
    });
  }

  private getUsersRecordForUsersWithFilters(
    filteredItems: User[],
    users: TemplateModel<User>,
  ): Record<number, Observable<TemplateModel<User>>> {
    const pageSize = 2;
    const totalPages = Math.ceil(filteredItems.length / pageSize);
    const usersRecord: Record<number, Observable<TemplateModel<User>>> = {};
    const { loading, error } = users;
    if (totalPages) {
      for (let page = 1; page <= totalPages; page++) {
        const start = (page - 1) * pageSize;
        const pageItems = filteredItems.slice(start, start + pageSize);
        usersRecord[page] = of({
          items: pageItems,
          total: filteredItems.length,
          loading,
          error,
        });
      }
    } else {
      usersRecord[1] = of({
        items: [],
        total: 0,
        loading,
        error,
      });
    }
    return usersRecord;
  }

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
    this.currentIndex.set(page.page - 1);
    this.selectedPageSubject.next(page);
  }

  setFormValue(formValue: FormValue): void {
    this.formValueSubject.next(formValue);
  }

  openUserDetailModal(user: User): void {
    this.selectedUser.set(user);
    this.modalOpen.set(true);
  }

  closeUserDetailModal(): void {
    this.modalOpen.set(false);
  }

  retryOnError(): void {
    if (this.selectedPageType() === SearchType.WITH_FILTERS) {
      this.retryUsersWithFilters.next();
    } else {
      this.retryUsersWithoutFilters.next();
    }
  }

  private getUsersWithoutFilters({
    page,
    limit,
  }: UsersRequest): Observable<TemplateModel<User>> {
    return this.getUsersUseCase.execute({ page, limit }).pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
      catchError(() => {
        return of({ items: [], loading: false, error: true, total: 0 });
      }),
    );
  }
}

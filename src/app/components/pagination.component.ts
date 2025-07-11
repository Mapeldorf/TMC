import { Component, computed, input, output } from '@angular/core';
import { NextPageTrigger, SearchType } from '../pages/users/users.page';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-pagination',
  template: `
    @for (page of pages(); track $index) {
      <button (click)="setSelectedPage($index)">Page {{ $index + 1 }}</button>
    }
  `,
})
export class PaginationComponent {
  selectedPage = output<NextPageTrigger>();

  total = input<number>();

  type = input<SearchType>();

  pages = computed(() => {
    const total = this.total();
    if (total) {
      return Array.from({ length: Math.ceil(total / 2) });
    }
    return [];
  });

  setSelectedPage(pageNumber: number): void {
    const type = this.type();
    if (type) {
      this.selectedPage.emit({ page: pageNumber + 1, type });
    }
  }
}

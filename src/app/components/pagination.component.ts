import { Component, computed, input, output } from '@angular/core';
import { NextPageTrigger } from '../interfaces/next-page-trigger.interface';
import { SearchType } from '../enums/search-type.enum';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-pagination',
  template: `
    <nav
      class="flex flex-wrap justify-center gap-4 mt-8"
      role="navigation"
      aria-label="Paginación"
    >
      @for (page of pages(); track $index) {
        <button
          type="button"
          (click)="setSelectedPage($index)"
          class="px-4 py-2 bg-white border border-sky-300 text-sky-600 rounded-lg hover:bg-sky-100 transition focus:outline-none focus:ring-2 focus:ring-sky-400"
          [attr.aria-label]="'Ir a la página ' + ($index + 1)"
        >
          Página {{ $index + 1 }}
        </button>
      }
    </nav>
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

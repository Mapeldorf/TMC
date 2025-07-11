import { Component, computed, input, output } from '@angular/core';
import { NextPageTrigger } from '../interfaces/next-page-trigger.interface';
import { SearchType } from '../enums/search-type.enum';
import { NgClass } from '@angular/common';

@Component({
  standalone: true,
  imports: [NgClass],
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
          class="px-4 py-2 rounded-lg transition focus:outline-none focus:ring-2"
          [ngClass]="{
            'bg-sky-500 text-white border border-sky-600 hover:bg-sky-600 focus:ring-sky-300':
              currentIndex() === $index,
            'bg-white text-sky-600 border border-sky-300 hover:bg-sky-100 focus:ring-sky-400':
              currentIndex() !== $index,
          }"
          [attr.aria-current]="currentIndex() === $index ? 'page' : null"
          [attr.aria-label]="'Ir a la página ' + ($index + 1)"
        >
          Página {{ $index + 1 }}
        </button>
      }
    </nav>
  `,
})
export class PaginationComponent {
  readonly selectedPage = output<NextPageTrigger>();

  readonly currentIndex = input<number>();

  readonly total = input<number>();

  readonly type = input<SearchType>();

  readonly pages = computed(() => {
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

import { Component, computed, input, output } from '@angular/core';

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
  selectedPage = output<number>();

  total = input<number>();

  pages = computed(() => {
    const total = this.total();
    if (total) {
      return Array.from({ length: total / 2 });
    }
    return [];
  });

  setSelectedPage(pageNumber: number): void {
    this.selectedPage.emit(pageNumber + 1);
  }
}

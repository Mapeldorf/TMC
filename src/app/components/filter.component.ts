import { NgClass } from '@angular/common';
import { Component, inject, Output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, filter, map, merge, startWith } from 'rxjs';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  selector: 'app-filter',
  template: `
    <form
      [formGroup]="form"
      class="bg-white p-6 rounded-2xl shadow-md space-y-6"
      role="search"
      aria-label="Formulario de filtrado de usuarios"
    >
      <div class="space-y-2">
        <label for="name" class="block text-sky-700 font-medium">Nombre</label>
        <input
          id="name"
          type="text"
          formControlName="name"
          class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
          autocomplete="name"
        />
      </div>
      <div class="space-y-2">
        <label for="email" class="block text-sky-700 font-medium">Email</label>
        <input
          id="email"
          type="email"
          formControlName="email"
          class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
          autocomplete="email"
        />
      </div>
      <button
        [disabled]="disabledState()"
        (click)="clearFilters()"
        [ngClass]="{
          'bg-sky-500 hover:bg-sky-600 text-white cursor-pointer':
            !disabledState(),
          'bg-gray-300 text-gray-500 cursor-not-allowed': disabledState(),
        }"
        class="font-semibold py-2 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
        aria-label="Limpiar filtros"
      >
        Limpiar Filtros
      </button>
    </form>
  `,
})
export class FilterComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    name: [''],
    email: [''],
  });

  private readonly disabledState$ = this.form.valueChanges.pipe(
    map((formValue) => !formValue.name && !formValue.email),
    startWith(true),
  );

  readonly disabledState = toSignal(this.disabledState$);

  private readonly formValueChange$ = this.form.valueChanges.pipe(
    filter(({ name, email }) => Boolean(email) || Boolean(name)),
    debounceTime(750),
  );

  private readonly clearFilters$ = this.form.valueChanges.pipe(
    filter(({ name, email }) => !email && !name),
  );

  @Output() formValue = merge(this.formValueChange$, this.clearFilters$);

  clearFilters(): void {
    this.form.setValue({ email: '', name: '' });
  }
}

import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormValue } from '../interfaces/form-value.interface';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  selector: 'app-filter',
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
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
        type="submit"
        class="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
        aria-label="Aplicar filtros"
      >
        Filtrar
      </button>
    </form>
  `,
})
export class FilterComponent {
  private readonly fb = inject(FormBuilder);

  readonly formValue = output<FormValue>();

  readonly form = this.fb.group({
    name: [''],
    email: [''],
  });

  onSubmit(): void {
    this.formValue.emit(this.form.value);
  }
}

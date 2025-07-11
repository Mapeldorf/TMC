import { Component, input, output } from '@angular/core';
import { TemplateModel } from '../interfaces/template-model.interface';
import { User } from '../interfaces/user.interface';

@Component({
  standalone: true,
  selector: 'app-list',
  template: `
    @if (users(); as users) {
      @if (users.loading) {
        <div
          class="flex justify-center items-center h-full w-full p-8"
          role="status"
          aria-live="polite"
        >
          <div
            class="animate-spin rounded-full h-16 w-16 border-4 border-sky-500 border-t-transparent"
            aria-hidden="true"
          ></div>
          <span class="sr-only">Cargando...</span>
        </div>
      } @else if (users.error) {
        <div
          class="flex items-center gap-3 p-4 rounded-xl bg-red-100 text-red-700 border border-red-300 shadow-sm"
          role="alert"
        >
          <svg
            class="w-6 h-6 text-red-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z"
            ></path>
          </svg>
          <span
            >Ocurrió un error al cargar los datos. Por favor, intenta
            nuevamente.</span
          >
        </div>
      } @else if (users.items.length) {
        <div
          class="overflow-x-auto bg-white rounded-2xl shadow-md p-4"
          role="region"
          aria-label="Tabla de usuarios"
        >
          <table class="min-w-full table-auto">
            <thead class="bg-sky-100 text-sky-700">
              <tr>
                <th class="text-left px-4 py-2 scope-col">Nombre</th>
                <th class="text-left px-4 py-2 scope-col">Email</th>
                <th class="text-left px-4 py-2 scope-col">Teléfono</th>
                <th class="text-left px-4 py-2 scope-col">Empresa</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users.items; track $index) {
                <tr
                  (click)="setSelectedUser(user)"
                  class="border-b hover:bg-gray-100"
                >
                  <td class="px-4 py-3">{{ user.name }}</td>
                  <td class="px-4 py-3">{{ user.email }}</td>
                  <td class="px-4 py-3">{{ user.phone }}</td>
                  <td class="px-4 py-3">{{ user.company.name }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div
          class="flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl shadow-md border border-gray-200 text-gray-500"
          role="status"
          aria-live="polite"
        >
          <p class="text-lg font-medium">No hay elementos para mostrar</p>
          <p class="text-sm mt-1">
            Intenta aplicar otros filtros o vuelve más tarde.
          </p>
        </div>
      }
    }
  `,
})
export class ListComponent {
  readonly users = input<TemplateModel<User>>();

  readonly selectedUser = output<User>();

  setSelectedUser(user: User): void {
    this.selectedUser.emit(user);
  }
}

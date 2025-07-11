import { Component, input } from '@angular/core';
import { TemplateModel } from '../interfaces/template-model.interface';
import { User } from '../interfaces/user.interface';

@Component({
  standalone: true,
  selector: 'app-list',
  template: `
    <div class="overflow-x-auto bg-white rounded-2xl shadow-md p-4">
      <table class="min-w-full table-auto">
        <thead class="bg-sky-100 text-sky-700">
          <tr>
            <th class="text-left px-4 py-2">Name</th>
            <th class="text-left px-4 py-2">Email</th>
          </tr>
        </thead>
        <tbody>
          @for (user of users()?.items; track $index) {
            <tr class="border-b hover:bg-gray-100">
              <td class="px-4 py-3">{{ user.name }}</td>
              <td class="px-4 py-3">{{ user.email }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ListComponent {
  users = input<TemplateModel<User>>();
}

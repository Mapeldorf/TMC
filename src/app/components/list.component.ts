import { JsonPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { TemplateModel } from '../interfaces/template-model.interface';
import { User } from '../interfaces/user.interface';

@Component({
  standalone: true,
  imports: [JsonPipe],
  selector: 'app-list',
  template: ` <pre>{{ users() | json }}</pre> `,
})
export class ListComponent {
  users = input<TemplateModel<User>>();
}

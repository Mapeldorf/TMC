import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormValue } from '../interfaces/form-value.interface';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  selector: 'app-filter',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div>
        <label for="name">Name</label>
        <input id="name" type="text" formControlName="name" />
      </div>
      <div>
        <label for="email">Email</label>
        <input id="email" type="email" formControlName="email" />
      </div>
      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  `,
})
export class FilterComponent {
  private readonly fb = inject(FormBuilder);

  formValue = output<FormValue>();

  readonly form = this.fb.group({
    name: [''],
    email: [''],
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.formValue.emit(this.form.value);
    }
  }
}

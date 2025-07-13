import {
  Component,
  input,
  output,
  ElementRef,
  effect,
  HostListener,
  viewChild,
} from '@angular/core';
import { User } from '../interfaces/user.interface';

@Component({
  selector: 'app-user-detail-modal',
  standalone: true,
  template: `
    @if (open()) {
      @if (user(); as user) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out opacity-100"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div
            #modalPanel
            class="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-7 space-y-8 outline-none transform transition-all duration-300 ease-out opacity-0 scale-95 animate-fade-in"
            tabindex="-1"
          >
            <div class="flex items-start justify-between">
              <h2 id="modal-title" class="text-2xl font-semibold text-sky-700">
                {{ user.name }}
              </h2>
              <button
                type="button"
                (click)="closeModal.emit()"
                class="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-full p-1"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>
            <div
              id="modal-description"
              class="text-gray-700 text-[15px] space-y-6"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <div class="space-y-2">
                  <h3 class="font-semibold text-sky-600 text-lg mb-1">
                    Información básica
                  </h3>
                  <p><strong>Username:</strong> {{ user.username }}</p>
                  <p><strong>Email:</strong> {{ user.email }}</p>
                  <p><strong>Teléfono:</strong> {{ user.phone }}</p>
                  <p>
                    <strong>Web:</strong>
                    <a
                      class="text-sky-500 hover:underline break-all"
                      href="https://{{ user.website }}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ user.website }}
                    </a>
                  </p>
                </div>
                <div class="space-y-2">
                  <h3 class="font-semibold text-sky-600 text-lg mb-1">
                    Compañía
                  </h3>
                  <p><strong>Nombre:</strong> {{ user.company.name }}</p>
                  <p>
                    <strong>Frase:</strong> "{{ user.company.catchPhrase }}"
                  </p>
                  <p><strong>Sector:</strong> {{ user.company.bs }}</p>
                </div>
                <div class="md:col-span-2 space-y-2">
                  <h3 class="font-semibold text-sky-600 text-lg mb-1">
                    Dirección
                  </h3>
                  <p>
                    {{ user.address.street }}, {{ user.address.suite }},
                    {{ user.address.city }} ({{ user.address.zipcode }})
                  </p>
                  <p>
                    <strong>Geo:</strong> Lat: {{ user.address.geo.lat }}, Lng:
                    {{ user.address.geo.lng }}
                  </p>
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-6">
              <button
                type="button"
                (click)="closeModal.emit()"
                class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      }
    }
  `,
})
export class UserDetailModalComponent {
  readonly open = input<boolean>();

  readonly user = input<User | null>();

  readonly closeModal = output<void>();

  readonly modalPanel = viewChild<ElementRef<HTMLElement>>('modalPanel');

  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.open()) {
      this.closeModal.emit();
    }
  }

  constructor() {
    effect(() => {
      if (this.open()) {
        this.modalPanel()?.nativeElement?.focus();
      }
    });
  }
}

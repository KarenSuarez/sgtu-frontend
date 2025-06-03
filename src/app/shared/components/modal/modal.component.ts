// src/app/shared/components/modal/modal.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="show">
      <div class="modal-content">
        <ng-content></ng-content> </div>
    </div>
  `,
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnChanges {
  @Input() show: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show'] && changes['show'].currentValue === true) {
      // Opcional: Deshabilitar scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else if (changes['show'] && changes['show'].currentValue === false) {
      document.body.style.overflow = 'auto';
    }
  }

  // Se podría añadir un método para cerrar al hacer clic en el overlay si se desea
  // closeOnOverlayClick(event: MouseEvent): void {
  //   if (event.target === event.currentTarget) { // Si el clic es en el overlay, no en el contenido
  //     this.closeModal.emit();
  //   }
  // }
}

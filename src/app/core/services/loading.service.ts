// src/app/core/services/loading.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable(); // Observable para que los componentes se suscriban

  constructor() { }

  /**
   * Muestra el indicador de carga.
   */
  show(): void {
    this.loadingSubject.next(true);
  }

  /**
   * Oculta el indicador de carga.
   */
  hide(): void {
    this.loadingSubject.next(false);
  }
}

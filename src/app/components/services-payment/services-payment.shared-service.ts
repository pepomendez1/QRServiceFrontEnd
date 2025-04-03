import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedService {
  private accion = new Subject<string>();
  accion$ = this.accion.asObservable();

  emitirEvento(mensaje: string) {
    this.accion.next(mensaje);
  }
}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedService {

  // Definimos las constantes de eventos
  static readonly UPDATE_HISTORY = 'update_history';
  static readonly UPDATE_MY_SERVICES = 'update_my_services';
  static readonly UPDATE_EXPIRATIONS = 'update_expirations';

  private accion = new Subject<string>();
  accion$ = this.accion.asObservable();

  emitirEvento(mensaje: string) {
    this.accion.next(mensaje);
  }
}

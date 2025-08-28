import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { RouteOption } from '../../../models/route-option.model';
import { Store } from '@ngrx/store';
import { RouteState } from '../../../store/menu.reducer';
import { CommonModule } from '@angular/common';
import { selectRoute } from '../../../store/menu.action';

@Component({
  selector: 'display',
  imports: [CommonModule],
  templateUrl: './display.component.html',
  styleUrl: './display.component.css'
})
export class DisplayComponent {

  routes$: Observable<RouteOption[]>;
  selectedRouteId$: Observable<number | null>;

  constructor(private store: Store<{ routes: RouteState }>) {
    this.routes$ = this.store.select(state => state.routes.routes);
    this.selectedRouteId$ = this.store.select(state => state.routes.selectedRouteId);
  }

  // Método para seleccionar una ruta
  onRouteSelect(routeId: number) {
    console.log('Ruta seleccionada desde display:', routeId);
    this.store.dispatch(selectRoute({ routeId }));
  }

  // Método para verificar si una ruta está seleccionada
  isRouteSelected(routeId: number, selectedRouteId: number | null): boolean {
    return routeId === selectedRouteId;
  }

  // Método para manejar el hover sobre las rutas
  onRouteHover(routeId: number, event: Event, isEntering: boolean) {
    const target = event.target as HTMLElement;
    
    // Obtener el estado actual de la ruta seleccionada
    this.selectedRouteId$.subscribe(selectedRouteId => {
      const isSelected = this.isRouteSelected(routeId, selectedRouteId);
      
      if (isEntering) {
        // Mouse enter
        if (!isSelected) {
          target.style.background = 'rgba(255,255,255,0.05)';
        }
      } else {
        // Mouse leave
        if (!isSelected) {
          target.style.background = 'transparent';
        }
      }
    }).unsubscribe(); // Desuscribirse inmediatamente ya que solo necesitamos el valor actual
  }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import mapboxgl from 'mapbox-gl';
import { MenuViewComponent } from '../menu-view/menu-view.component';
import { MenuComponent } from '../menu-view/menu/menu.component';
import { selectRoute, setRoutes } from '../../store/menu.action';
import { RouteOption } from '../../models/route-option.model';
import { RouteState } from '../../store/menu.reducer';

@Component({
  selector: 'app-agent-map',
  imports: [MenuViewComponent],
  templateUrl: './agent-map.component.html',
  styleUrl: './agent-map.component.css'
})
export class AgentMapComponent implements OnInit, OnDestroy {
  selected!: string;
  private map: any;
  private startPoint: [number, number] | null = null;
  private endPoint: [number, number] | null = null;
  private startMarker: mapboxgl.Marker | null = null;
  private endMarker: mapboxgl.Marker | null = null;
  private clickCount: number = 0;
  private currentRoutes: RouteOption[] = [];
  private selectedRouteId: number | null = null;
  
  ngOnInit() {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vyb254ZCIsImEiOiJjbWRkYmZ1d2YwMnhkMnJwczFiYm50c3A5In0.gEYtfkfPfjQc3-h8dU_5Ow';
    
    this.map = new mapboxgl.Map({
      container: 'agent-map',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-73.03, -36.83],
      zoom: 13,
    });

    this.map.on('load', () => {
      console.log('Mapa de agentes cargado');
      this.setupMapClickListeners();
    });

    this.map.on('error', (e: any) => {
      console.error('Error del mapa de agentes:', e);
    });
  }

  ngOnDestroy() {
    this.clearAllMarkers();
    this.clearAllRoutes();
    this.removeRoutePanel();
  }

  private setupMapClickListeners() {
    this.map.on('click', (e: any) => {
      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      
      if (this.clickCount === 0) {
        // Primer click - punto de inicio
        this.setStartPoint(coordinates);
        this.clickCount = 1;
      } else if (this.clickCount === 1) {
        // Segundo click - punto de destino
        this.setEndPoint(coordinates);
        this.clickCount = 0;
        this.calculateRoutes();
      }
    });

    this.map.getCanvas().style.cursor = 'crosshair';
  }


  private setStartPoint(coordinates: [number, number]) {
    this.startPoint = coordinates;
    
    if (this.startMarker) {
      this.startMarker.remove();
    }

    const startEl = document.createElement('div');
    startEl.style.width = '30px';
    startEl.style.height = '30px';
    startEl.style.borderRadius = '50%';
    startEl.style.backgroundColor = '#4CAF50';
    startEl.style.border = '3px solid white';
    startEl.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    startEl.innerHTML = '<div style="text-align: center; line-height: 24px; font-size: 16px;">🚀</div>';

    this.startMarker = new mapboxgl.Marker(startEl)
      .setLngLat(coordinates)
      .addTo(this.map);

    const instructionText = document.getElementById('instruction-text');
    if (instructionText) {
      instructionText.textContent = '2. Haz clic para seleccionar el destino';
    }

    console.log('Punto de inicio seleccionado:', coordinates);
  }

  private setEndPoint(coordinates: [number, number]) {
    this.endPoint = coordinates;
    
    if (this.endMarker) {
      this.endMarker.remove();
    }

    const endEl = document.createElement('div');
    endEl.style.width = '30px';
    endEl.style.height = '30px';
    endEl.style.borderRadius = '50%';
    endEl.style.backgroundColor = '#F44336';
    endEl.style.border = '3px solid white';
    endEl.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    endEl.innerHTML = '<div style="text-align: center; line-height: 24px; font-size: 16px;">🎯</div>';

    this.endMarker = new mapboxgl.Marker(endEl)
      .setLngLat(coordinates)
      .addTo(this.map);

    const instructionText = document.getElementById('instruction-text');
    if (instructionText) {
      instructionText.textContent = 'Calculando rutas... ✨';
    }

    console.log('Punto de destino seleccionado:', coordinates);
  }

  private calculateRoutes() {
    if (!this.startPoint || !this.endPoint) return;

    this.clearAllRoutes();

    // Generar rutas mock
    const mockRoutes: RouteOption[] = [
      {
        id: 1,
        name: 'Ruta con Transporte',
        duration: '12 min',
        distance: '2.8 km',
        type: 'Bus + Caminando',
        coordinates: this.generateMockRoute(this.startPoint, this.endPoint, 'transit'),
        color: '#FF9800',
        durationMinutes: 12
      },
      {
        id: 2,
        name: 'Ruta Directa',
        duration: '15 min',
        distance: '2.3 km',
        type: 'Caminando',
        coordinates: this.generateMockRoute(this.startPoint, this.endPoint, 'direct'),
        color: '#2196F3',
        durationMinutes: 15
      },
      {
        id: 3,
        name: 'Ruta Escénica',
        duration: '22 min',
        distance: '3.1 km',
        type: 'Caminando',
        coordinates: this.generateMockRoute(this.startPoint, this.endPoint, 'scenic'),
        color: '#4CAF50',
        durationMinutes: 22
      }
    ];
    console.log('Rutas mock generadas:', mockRoutes);

    this.store.dispatch(setRoutes({ routes: mockRoutes }));


    // Ordenar por velocidad (menor duración primero)
    this.currentRoutes = [...mockRoutes].sort((a, b) => a.durationMinutes - b.durationMinutes);
    
    // Plotear automáticamente la ruta más rápida
    const fastestRoute = this.currentRoutes[0];
    this.selectedRouteId = fastestRoute.id;

    this.store.dispatch(selectRoute({ routeId: fastestRoute.id }));

    this.plotRoute(fastestRoute);
    
  }

  private generateMockRoute(start: [number, number], end: [number, number], type: string): [number, number][] {
    const route: [number, number][] = [start];
    
    switch (type) {
      case 'direct':
        route.push([
          start[0] + (end[0] - start[0]) * 0.3,
          start[1] + (end[1] - start[1]) * 0.3
        ]);
        route.push([
          start[0] + (end[0] - start[0]) * 0.7,
          start[1] + (end[1] - start[1]) * 0.7
        ]);
        break;
        
      case 'scenic':
        route.push([
          start[0] + (end[0] - start[0]) * 0.2 + 0.005,
          start[1] + (end[1] - start[1]) * 0.2 - 0.003
        ]);
        route.push([
          start[0] + (end[0] - start[0]) * 0.4 + 0.008,
          start[1] + (end[1] - start[1]) * 0.4 - 0.005
        ]);
        route.push([
          start[0] + (end[0] - start[0]) * 0.6 + 0.003,
          start[1] + (end[1] - start[1]) * 0.6 - 0.002
        ]);
        route.push([
          start[0] + (end[0] - start[0]) * 0.8,
          start[1] + (end[1] - start[1]) * 0.8
        ]);
        break;
        
      case 'transit':
        route.push([
          start[0] + (end[0] - start[0]) * 0.25,
          start[1] + (end[1] - start[1]) * 0.15
        ]);
        route.push([
          start[0] + (end[0] - start[0]) * 0.5,
          start[1] + (end[1] - start[1]) * 0.3
        ]);
        route.push([
          start[0] + (end[0] - start[0]) * 0.75,
          start[1] + (end[1] - start[1]) * 0.6
        ]);
        break;
    }
    
    route.push(end);
    return route;
  }

  private plotRoute(route: RouteOption) {
    // Limpiar ruta actual
    this.clearCurrentRoute();

    // Agregar nueva ruta
    const routeId = 'selected-route';
    
    this.map.addSource(routeId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates
        }
      }
    });

    this.map.addLayer({
      id: routeId,
      type: 'line',
      source: routeId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': route.color,
        'line-width': 6,
        'line-opacity': 0.9
      }
    });

    // Agregar línea de fondo para mejor visibilidad
    this.map.addLayer({
      id: 'selected-route-bg',
      type: 'line',
      source: routeId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#ffffff',
        'line-width': 8,
        'line-opacity': 0.5
      }
    }, routeId);

    console.log('Ruta ploteada:', route.name);
  }


  private removeRoutePanel() {
    const existingPanel = document.getElementById('route-panel');
    if (existingPanel) {
      existingPanel.remove();
    }
  }

  private clearCurrentRoute() {
    if (this.map.getLayer('selected-route')) {
      this.map.removeLayer('selected-route');
    }
    if (this.map.getLayer('selected-route-bg')) {
      this.map.removeLayer('selected-route-bg');
    }
    if (this.map.getSource('selected-route')) {
      this.map.removeSource('selected-route');
    }
  }

  private clearAll() {
    this.clearAllMarkers();
    this.clearAllRoutes();
    this.removeRoutePanel();
    this.startPoint = null;
    this.endPoint = null;
    this.clickCount = 0;
    this.currentRoutes = [];
    this.selectedRouteId = null;
    
    const instructionText = document.getElementById('instruction-text');
    if (instructionText) {
      instructionText.textContent = '1. Haz clic para seleccionar el punto de inicio';
    }
    
    console.log('Todo limpiado');
  }

  private clearAllMarkers() {
    if (this.startMarker) {
      this.startMarker.remove();
      this.startMarker = null;
    }
    if (this.endMarker) {
      this.endMarker.remove();
      this.endMarker = null;
    }
  }

  private clearAllRoutes() {
    this.clearCurrentRoute();
  }
    
  constructor(private store: Store<{ menu: string, routes: RouteState }>) {
    this.store.select('menu').subscribe(menu => {
      console.log('Menu state:', menu);
      this.selected = menu;
    });

    // Escuchar cambios en la ruta seleccionada desde el store
    this.store.select(state => state.routes?.selectedRouteId).subscribe(routeId => {
      if (routeId && routeId !== this.selectedRouteId && this.currentRoutes.length > 0) {
        console.log('Nueva ruta seleccionada desde store:', routeId);
        this.selectRouteFromStore(routeId);
      }
    });
  }

  // Método para seleccionar ruta desde el store (sin dispatchar de nuevo)
  private selectRouteFromStore(routeId: number) {
    const selectedRoute = this.currentRoutes.find(r => r.id === routeId);
    if (!selectedRoute) return;

    this.selectedRouteId = routeId;
    this.plotRoute(selectedRoute);
    

    console.log('Ruta actualizada en mapa:', selectedRoute.name);
  }

}
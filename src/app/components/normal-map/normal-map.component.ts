import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import mapboxgl from 'mapbox-gl';
import { MenuComponent } from '../menu-view/menu/menu.component';
import { MenuViewComponent } from '../menu-view/menu-view.component';
import { TimeState } from '../../store/time.reducer';

interface Agent {
  id: string;
  name: string;
  startPoint: [number, number];
  endPoint: [number, number];
  route: [number, number][];
  color: string;
  currentPosition: [number, number];
  progress: number; // 0 a 1
  startTime: number; // Hora de inicio en minutos desde las 00:00
  endTime: number; // Hora de fin en minutos
  isActive: boolean;
  marker?: mapboxgl.Marker;
}

@Component({
  selector: 'normal-map',
  imports: [ MenuViewComponent],
  templateUrl: './normal-map.component.html',
  styleUrl: './normal-map.component.css'
})
export class NormalMapComponent implements OnInit, OnDestroy {
  selected!: string;
  private map: any;
  private agents: Agent[] = [];
  private currentTimeMinutes: number = 480; // 8:00 AM inicial
  
  ngOnInit() {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vyb254ZCIsImEiOiJjbWRkYmZ1d2YwMnhkMnJwczFiYm50c3A5In0.gEYtfkfPfjQc3-h8dU_5Ow';
    
    this.map = new mapboxgl.Map({
      container: 'normal-map',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-73.03, -36.83],
      zoom: 13,
    });

    this.map.on('load', () => {
      console.log('Mapa normal cargado (sin heatmap)');
      this.initializeAgents();
      this.updateAgentsPosition();
    });

    this.map.on('error', (e: any) => {
      console.error('Error del mapa normal:', e);
    });
  }

  ngOnDestroy() {
    // Limpiar marcadores al destruir el componente
    this.agents.forEach(agent => {
      if (agent.marker) {
        agent.marker.remove();
      }
    });
  }

  private initializeAgents() {
    // Definir 3 agentes con rutas diferentes en Concepción
    this.agents = [
      {
        id: 'turista-1',
        name: 'Turista 1',
        startPoint: [-73.0444, -36.8201], // Centro de Concepción
        endPoint: [-73.0367, -36.8089], // Plaza de la Independencia
        route: [
          [-73.0444, -36.8201], // Centro
          [-73.0420, -36.8150], // Punto intermedio 1
          [-73.0390, -36.8120], // Punto intermedio 2
          [-73.0367, -36.8089]  // Destino final
        ],
        color: '#FF6B6B', // Rojo
        currentPosition: [-73.0444, -36.8201],
        progress: 0,
        startTime: 480, // 8:00 AM (8 * 60)
        endTime: 600,   // 10:00 AM (10 * 60)
        isActive: false,
        marker: undefined
      },
      {
        id: 'turista-2',
        name: 'Turista 2',
        startPoint: [-73.0513, -36.8340], // Barrio Universidad
        endPoint: [-73.0297, -36.8278], // Zona residencial
        route: [
          [-73.0513, -36.8340], // Universidad
          [-73.0480, -36.8310], // Punto intermedio 1
          [-73.0450, -36.8290], // Punto intermedio 2
          [-73.0400, -36.8280], // Punto intermedio 3
          [-73.0350, -36.8279], // Punto intermedio 4
          [-73.0297, -36.8278]  // Destino final
        ],
        color: '#4ECDC4', // Verde agua
        currentPosition: [-73.0513, -36.8340],
        progress: 0,
        startTime: 540, // 9:00 AM (9 * 60)
        endTime: 720,   // 12:00 PM (12 * 60)
        isActive: false,
        marker: undefined
      },
      {
        id: 'turista-3',
        name: 'Turista 3',
        startPoint: [-73.0589, -36.8156], // Zona comercial
        endPoint: [-73.0234, -36.8401], // Zona industrial
        route: [
          [-73.0589, -36.8156], // Zona comercial
          [-73.0550, -36.8200], // Punto intermedio 1
          [-73.0500, -36.8250], // Punto intermedio 2
          [-73.0450, -36.8300], // Punto intermedio 3
          [-73.0400, -36.8350], // Punto intermedio 4
          [-73.0350, -36.8380], // Punto intermedio 5
          [-73.0234, -36.8401]  // Destino final
        ],
        color: '#45B7D1', // Azul
        currentPosition: [-73.0589, -36.8156],
        progress: 0,
        startTime: 600, // 10:00 AM (10 * 60)
        endTime: 780,   // 1:00 PM (13 * 60)
        isActive: false,
        marker: undefined
      }
    ];

    // Crear marcadores para cada agente
    this.agents.forEach(agent => {
      this.createAgentMarker(agent);
    });
  }

  private createAgentMarker(agent: Agent) {
    // Crear elemento HTML personalizado para el marcador
    const el = document.createElement('div');
    el.className = 'agent-marker';
    el.style.backgroundColor = agent.color;
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    el.style.cursor = 'pointer';
    el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    el.innerHTML = `<div style="font-size: 10px; text-align: center; line-height: 16px;">🚶</div>`;

    // Crear marcador
    agent.marker = new mapboxgl.Marker(el)
      .setLngLat(agent.currentPosition)
      .addTo(this.map);

    // Agregar popup con información del agente
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div style="font-size: 12px;">
        <strong>${agent.name}</strong><br>
        Estado: ${agent.isActive ? '🚶 En movimiento' : '⏸️ Inactivo'}<br>
        Inicio: ${this.minutesToTime(agent.startTime)}<br>
        Fin: ${this.minutesToTime(agent.endTime)}<br>
        Progreso: ${Math.round(agent.progress * 100)}%
      </div>
    `);

    agent.marker.setPopup(popup);

    // Inicialmente oculto si no está activo
    if (!agent.isActive) {
      agent.marker.getElement().style.display = 'none';
    }
  }

  private updateAgentsPosition() {
    this.agents.forEach(agent => {
      // Verificar si el agente debe estar activo según el tiempo actual
      const shouldBeActive = this.currentTimeMinutes >= agent.startTime && this.currentTimeMinutes <= agent.endTime;
      
      if (shouldBeActive) {
        agent.isActive = true;
        
        // Calcular progreso basado en el tiempo
        const totalDuration = agent.endTime - agent.startTime;
        const elapsedTime = this.currentTimeMinutes - agent.startTime;
        agent.progress = Math.min(elapsedTime / totalDuration, 1);
        
        // Calcular nueva posición basada en el progreso
        agent.currentPosition = this.interpolateRoute(agent.route, agent.progress);
        
        // Mostrar y actualizar marcador
        if (agent.marker) {
          agent.marker.getElement().style.display = 'block';
          agent.marker.setLngLat(agent.currentPosition);
          
          // Actualizar popup
          const popup = agent.marker.getPopup();
          if (popup) {
            popup.setHTML(`
              <div style="font-size: 12px;">
                <strong>${agent.name}</strong><br>
                Estado: ${agent.isActive ? '🚶 En movimiento' : '⏸️ Inactivo'}<br>
                Inicio: ${this.minutesToTime(agent.startTime)}<br>
                Fin: ${this.minutesToTime(agent.endTime)}<br>
                Progreso: ${Math.round(agent.progress * 100)}%<br>
                Tiempo actual: ${this.minutesToTime(this.currentTimeMinutes)}
              </div>
            `);
          }
        }
      } else {
        agent.isActive = false;
        // Ocultar marcador si no está activo
        if (agent.marker) {
          agent.marker.getElement().style.display = 'none';
        }
      }
    });
  }

  private interpolateRoute(route: [number, number][], progress: number): [number, number] {
    if (progress <= 0) return route[0];
    if (progress >= 1) return route[route.length - 1];
    
    // Calcular qué segmento de la ruta corresponde al progreso
    const totalSegments = route.length - 1;
    const scaledProgress = progress * totalSegments;
    const segmentIndex = Math.floor(scaledProgress);
    const segmentProgress = scaledProgress - segmentIndex;
    
    if (segmentIndex >= totalSegments) {
      return route[route.length - 1];
    }
    
    // Interpolación lineal entre dos puntos
    const start = route[segmentIndex];
    const end = route[segmentIndex + 1];
    
    const lng = start[0] + (end[0] - start[0]) * segmentProgress;
    const lat = start[1] + (end[1] - start[1]) * segmentProgress;
    
    return [lng, lat];
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
  
  constructor(private store: Store<{ time: TimeState }>) {

    // Suscribirse al tiempo global
    this.store.select('time').subscribe(timeState => {
      this.currentTimeMinutes = timeState.h * 60 + timeState.m;
      console.log('Tiempo actualizado:', this.minutesToTime(this.currentTimeMinutes));
      
      // Actualizar posición de agentes cuando cambie el tiempo
      if (this.map && this.map.loaded()) {
        this.updateAgentsPosition();
      }
    });
  }
}
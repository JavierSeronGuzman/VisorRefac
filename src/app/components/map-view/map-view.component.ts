import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import mapboxgl from 'mapbox-gl'
import { MenuComponent } from '../menu-view/menu/menu.component';
import { MenuViewComponent } from '../menu-view/menu-view.component';
import { Store } from '@ngrx/store';
import { NormalMapComponent } from '../normal-map/normal-map.component';
import { AgentMapComponent } from '../agent-map/agent-map.component';

@Component({
    selector: 'app-map-view',
    imports: [CommonModule, MenuViewComponent, NormalMapComponent, AgentMapComponent],
    templateUrl: './map-view.component.html',
    styleUrl: './map-view.component.css',
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
    selected!: string;
    private map: any;

    ngAfterViewInit(): void {
        this.initializeMap;
    }

    ngOnDestroy(): void {
        // Limpiar el mapa al destruir el componente
        this.cleanupMap();
    }

    private initializeMap(): void {
        // Verificar que el elemento existe antes de crear el mapa
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }

        // Si ya existe un mapa, limpiarlo primero
        if (this.map) {
            this.cleanupMap();
        }

        console.log('Inicializando mapa...');
        mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vyb254ZCIsImEiOiJjbWRkYmZ1d2YwMnhkMnJwczFiYm50c3A5In0.gEYtfkfPfjQc3-h8dU_5Ow';
        
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [-73.04, -36.83],
            zoom: 12,
        });

        this.map.on('load', () => {
            console.log('Mapa cargado, agregando heatmap...');
            this.setupHeatmap();
        });

        this.map.on('error', (e: any) => {
            console.error('Error del mapa:', e);
        });
    }

    private cleanupMap(): void {
        if (this.map) {
            console.log('Limpiando mapa...');
            this.map.remove();
            this.map = null;
        }
    }
    
    private setupHeatmap(): void {
        if (!this.map) return;

        // ...existing heatmapData...
        const heatmapData = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": { "valor": 85 },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-73.05, -36.82]
                    }
                },
                {
                    "type": "Feature",
                    "properties": { "valor": 90 },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-73.04, -36.83]
                    }
                },
                {
                    "type": "Feature",
                    "properties": { "valor": 75 },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-73.03, -36.84]
                    }
                },
                {
                    "type": "Feature",
                    "properties": { "valor": 80 },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-73.052, -36.825]
                    }
                },
                {
                    "type": "Feature",
                    "properties": { "valor": 95 },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-73.035, -36.845]
                    }
                }
            ]
        };

        // Fuente con puntos en Concepción
        this.map.addSource('puntos-conce', {
            type: 'geojson',
            data: heatmapData
        });

        // Capa heatmap nativa de Mapbox
        this.map.addLayer({
            id: 'heatmap-layer',
            type: 'heatmap',
            source: 'puntos-conce',
            maxzoom: 20,
            layout: {
                'visibility': 'visible' // Siempre visible cuando se crea
            },
            paint: {
                'heatmap-weight': [
                    'interpolate',
                    ['linear'],
                    ['get', 'valor'],
                    0, 0,
                    100, 1
                ],
                'heatmap-intensity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 1,
                    9, 3,
                    15, 5
                ],
                'heatmap-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 30,
                    9, 50,
                    15, 80
                ],
                'heatmap-opacity': 1,
                'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(33,102,172,0)',
                    0.2, 'rgb(103,169,207)',
                    0.4, 'rgb(209,229,240)', 
                    0.6, 'rgb(253,219,199)',
                    0.8, 'rgb(239,138,98)',
                    1, 'rgb(178,24,43)'
                ]
            }
        });
        
        console.log('Heatmap agregado exitosamente');
    }


    constructor(private store: Store<{ menu: string, heatmap: boolean, ruta: boolean }>) {
        // Suscripción al menú
        this.store.select('menu').subscribe(menu => {
            console.log('Menu state:', menu);
            this.selected = menu;
            this.cleanupMap(); // Limpiar primero
            setTimeout(() => {
                this.initializeMap();
            }, 100);
        });

    }
}
import { Component, OnDestroy } from '@angular/core';
import { TimeState } from '../../../store/time.reducer';
import { Store } from '@ngrx/store';
import { timeAction } from '../../../store/time.action';

@Component({
  selector: 'heatmap',
  imports: [],
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.css'
})
export class HeatmapComponent implements OnDestroy {
    globalHours: number = 8;
    globalMinutes: number = 0;
    isPlaying: boolean = false;
    private intervalId: any;
  
    constructor(
      private store: Store<{time: TimeState}>
    ){
      this.store.select('time').subscribe((timeState) => {
        this.globalHours = timeState.h;
        this.globalMinutes = timeState.m;
        console.log(`Tiempo actualizado: ${this.globalHours} horas y ${this.globalMinutes} minutos`);
      });
    }
  
    ngOnDestroy() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
    }
  
    get minutes(): number {
      return this.globalHours * 60 + this.globalMinutes;
    }
  
    set minutes(totalMinutes: number) {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      
      this.store.dispatch(timeAction({ h, m }));
    }
  
    get time(): string {
      return `${this.globalHours.toString().padStart(2, '0')}:${this.globalMinutes.toString().padStart(2, '0')}`;
    }
  
    // Método para reproducir/pausar
    togglePlay() {
      if (this.isPlaying) {
        this.pauseAnimation();
      } else {
        this.startAnimation();
      }
    }
  
    // Iniciar animación
    startAnimation() {
      this.isPlaying = true;
      this.intervalId = setInterval(() => {
        const currentMinutes = this.minutes;
        
        // Si llega al final (23:59 = 1439 minutos), reiniciar
        if (currentMinutes >= 1439) {
          this.minutes = 480;
          this.pauseAnimation();
        } else {
          this.minutes = currentMinutes + 1; // Incrementar 1 minuto cada intervalo
        }
      }, 100); // Cambia cada 50ms (puedes ajustar la velocidad)
    }
  
    // Pausar animación
    pauseAnimation() {
      this.isPlaying = false;
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  
    // Reset al tiempo inicial
    resetTime() {
      this.pauseAnimation();
      this.minutes = 480; // 8:00 AM
    }

}

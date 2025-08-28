import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { menuReducer, routesReducer} from './store/menu.reducer';
import { timeReducer } from './store/time.reducer';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideStore({
    menu: menuReducer,
    time: timeReducer,
    routes: routesReducer
  })]
};

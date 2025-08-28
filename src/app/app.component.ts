import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapViewComponent } from './components/map-view/map-view.component';
import { MenuViewComponent } from './components/menu-view/menu-view.component';

@Component({
  selector: 'app-root',
  imports: [MapViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'front-end';
}

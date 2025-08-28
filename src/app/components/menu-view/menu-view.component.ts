import { Component } from '@angular/core';
import { MenuComponent } from './menu/menu.component';
import { ControlsComponent } from './controls/controls.component';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { DisplayComponent } from './display/display.component';
import { AipromptComponent } from './aiprompt/aiprompt.component';
import { HeatmapComponent } from './heatmap/heatmap.component';

@Component({
  selector: 'app-menu-view',
  imports: [MenuComponent, ControlsComponent, CommonModule, DisplayComponent, AipromptComponent, HeatmapComponent],
  templateUrl: './menu-view.component.html',
  styleUrl: './menu-view.component.css'
})
export class MenuViewComponent {

  selected!: string;
  
    constructor(private store: Store<{ menu: string }>) {
      this.store.select('menu').subscribe(menu => {
        this.selected = menu;
      });
    }

}

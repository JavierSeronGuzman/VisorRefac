import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { menuAction } from '../../../store/menu.action';

@Component({
  selector: 'app-menu',
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {

  selected!: string;

  constructor(private store: Store<{ menu: string }>) {
    this.store.select('menu').subscribe(menu => {
      this.selected = menu;
    });
  }

  sendState(newstate: string): void {
    this.store.dispatch(menuAction({ newstate }));
  }
}

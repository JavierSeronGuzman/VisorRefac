import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharingDataService {

  private _clearRuta: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  get clearRuta(): EventEmitter<void> {
    return this._clearRuta;
  
  }
}

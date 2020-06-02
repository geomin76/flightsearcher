import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  public geoLocationData = [];

  constructor() { }

  getLocation(): any {
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          this.geoLocationData.push(position.coords.latitude);
          this.geoLocationData.push(position.coords.longitude);
        },
        error => {
          switch(error.code) {
            case 1:
              console.log("Permission Denied");
              break;
            case 2: 
              console.log("Position unavailable");
              break;
            case 3:
              console.log('Timeout')
              break;
          }
        }
      )
    }
    return this.geoLocationData;
  }
}

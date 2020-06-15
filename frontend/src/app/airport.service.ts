import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AirportService {

  constructor(private http: HttpClient) { }

  public getAirports(query) {
    var url = "http://localhost:3000/search?name=" + query;
    return this.http.get(url);
  }
}

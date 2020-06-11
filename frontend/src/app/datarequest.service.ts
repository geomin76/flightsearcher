import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DatarequestService {

  private url = "http://localhost:3000/results?lng=-77.018727&lat=38.859887&destination=LAX&outbound=2020-10&inbound=2020-10";

  constructor(private http: HttpClient) { }

  public getFlights() {
    return this.http.get(this.url);
  }

}

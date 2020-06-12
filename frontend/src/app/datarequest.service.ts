import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DatarequestService {

  public flights = [];

  constructor(private http: HttpClient) { }

  public getFlights(lng, lat, destination, date) {
    var url = "http://localhost:3000/results?lng=" + lng + "&lat=" + lat + "&destination=" + destination + "&outbound=" + date +"&inbound=" + date;
    return this.http.get(url);
  }

}

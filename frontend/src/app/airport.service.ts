import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AirportService {

  constructor(private http: HttpClient) { }

  public getAirports(query) {
    // var url = "http://ec2-54-85-15-137.compute-1.amazonaws.com:3000/search?name=" + query;
    var url = "https://aki73agy4h.execute-api.us-east-1.amazonaws.com/dev/search?name=" + query;
    return this.http.get(url);
  }
}

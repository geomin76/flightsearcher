import { Component, OnInit, ViewChild } from '@angular/core';
import { Search } from '../search';
import { Router } from '@angular/router';
import { DatarequestService } from '../datarequest.service';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { DatePipe } from '@angular/common'
import { AirportService } from '../airport.service';
import { debounce } from 'lodash';


@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css'],
  providers: [DatePipe]
})
export class QueryComponent implements OnInit {

  searchModel = new Search('', '', '');

  constructor(private dataService : DatarequestService, private router: Router, private datePipe: DatePipe, private airport: AirportService) {
    this.airportSearch = debounce(this.airportSearch, 500);
  }

  public lat = 0;
  public lng = 0;

  public currentDate = new Date();
  public preDate = '';
  public postDate = '';

  public airportData = {}
  

  ngOnInit(): void {
    this.preDate = this.datePipe.transform(this.currentDate, 'yyyy-MM');
    var datesplit = this.preDate.split('-');
    this.postDate = (parseInt(datesplit[0]) + 1).toString() + "-" + datesplit[1]
  }

  public setQuery(item) {
    this.searchModel.destination = item.code
    this.searchModel.holder = item.name
  }

  

  public async airportSearch(query) {
    this.airport.getAirports(query)
    .subscribe(
      val => {
        console.log(val)
        this.airportData = val
      }
      //need debounce
    )
  }


  @ViewChild("placesRef") placesRef : GooglePlaceDirective;
    
  public handleAddressChange(obj: any) {
    // Do some stuff
    this.lat = obj.geometry.location.lat()
    this.lng = obj.geometry.location.lng()
  }

  //need loading screen
  onSubmit() {
    // console.log(this.searchModel);
    if (this.lat != 0 && this.lng != 0) {
      this.dataService.getFlights(this.lng, this.lat, this.searchModel.destination, this.searchModel.time).subscribe((data: any[]) => {
        // console.log(data);
        this.dataService.flights = data;
        this.router.navigateByUrl('/results');
      })
    }
    else {
      console.log("error")
      // error
    }

  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { LocationService } from '../location.service';
import { Search } from '../search';
import { Router } from '@angular/router';
import { DatarequestService } from '../datarequest.service';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { LatLng } from 'ngx-google-places-autocomplete/objects/latLng';
import { Geometry } from 'ngx-google-places-autocomplete/objects/geometry';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnInit {

  searchModel = new Search('', '');

  constructor(private dataService : DatarequestService, private router: Router) { }

  public lat = 0;
  public lng = 0;


  ngOnInit(): void {
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

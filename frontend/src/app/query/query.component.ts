import { Component, OnInit } from '@angular/core';
import { LocationService } from '../location.service';
import { Search } from '../search';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnInit {

  searchModel = new Search('Tokyo', 'Tokyo', '2020-06');

  constructor(private _locationService: LocationService) { }

  // public gps = [];

  ngOnInit(): void {
    // this.gps = this._locationService.getLocation();
    // console.log(this.gps);
  }

  onSubmit() {
    console.log();
  }

}

import { Component, OnInit } from '@angular/core';
import { LocationService } from '../location.service';
import { Search } from '../search';
import { Router } from '@angular/router';
import { DatarequestService } from '../datarequest.service';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnInit {

  searchModel = new Search('', '', '');

  constructor(private dataService : DatarequestService, private router: Router) { }


  ngOnInit(): void {
  }

  //need loading screen
  onSubmit() {
    // console.log(this.searchModel);
    this.dataService.getFlights("-77.018727", "38.859887", this.searchModel.destination, this.searchModel.time).subscribe((data: any[]) => {
      // console.log(data);
      this.dataService.flights = data;
      this.router.navigateByUrl('/results');
    })
  }

}

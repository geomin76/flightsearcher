import { Component, OnInit } from '@angular/core';
import { DatarequestService } from '../datarequest.service';


@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {

  public flights = [];

  constructor(private dataService: DatarequestService) { }

  ngOnInit(): void {
    this.flights = this.dataService.flights
    console.log(this.flights);
  }

}

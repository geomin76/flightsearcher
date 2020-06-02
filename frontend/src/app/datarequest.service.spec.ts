import { TestBed } from '@angular/core/testing';

import { DatarequestService } from './datarequest.service';

describe('DatarequestService', () => {
  let service: DatarequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatarequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

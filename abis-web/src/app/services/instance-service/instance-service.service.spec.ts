import { TestBed } from '@angular/core/testing';

import { InstanceServiceService } from './instance-service.service';

describe('InstanceServiceService', () => {
  let service: InstanceServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstanceServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

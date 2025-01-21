import { TestBed } from '@angular/core/testing';

import { ServicesPaymentService } from './services-payment.service';

describe('ServicesPaymentService', () => {
  let service: ServicesPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicesPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

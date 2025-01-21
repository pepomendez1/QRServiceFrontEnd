import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCardsComponent } from './payment-cards.component';

describe('PaymentCardsComponent', () => {
  let component: PaymentCardsComponent;
  let fixture: ComponentFixture<PaymentCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentCardsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

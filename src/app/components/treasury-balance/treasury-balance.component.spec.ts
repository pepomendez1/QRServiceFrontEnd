import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasuryBalanceComponent } from './treasury-balance.component';

describe('TreasuryBalanceComponent', () => {
  let component: TreasuryBalanceComponent;
  let fixture: ComponentFixture<TreasuryBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreasuryBalanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TreasuryBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasuryAccountInfoComponent } from './treasury-account-info.component';

describe('TreasuryAccountInfoComponent', () => {
  let component: TreasuryAccountInfoComponent;
  let fixture: ComponentFixture<TreasuryAccountInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreasuryAccountInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TreasuryAccountInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

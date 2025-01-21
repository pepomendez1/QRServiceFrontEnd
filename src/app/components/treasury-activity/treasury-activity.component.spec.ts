import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasuryActivityComponent } from './treasury-activity.component';

describe('TreasuryActivityComponent', () => {
  let component: TreasuryActivityComponent;
  let fixture: ComponentFixture<TreasuryActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreasuryActivityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TreasuryActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

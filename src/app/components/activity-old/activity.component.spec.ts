import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityComponent } from './activity.component';

describe('ActivityComponent', () => {
  let component: ActivityComponent;
  let fixture: ComponentFixture<ActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct number of activities', () => {
    component.activities = [
      { id: '1', account_id: '123', amount: 100.0, type: 'Deposit', date: '2024-08-15T12:34:00Z' },
      { id: '2', account_id: '123', amount: -50.0, type: 'Withdrawal', date: '2024-08-16T09:10:00Z' },
    ];
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelectorAll('tbody tr').length).toBe(2);
  });
});

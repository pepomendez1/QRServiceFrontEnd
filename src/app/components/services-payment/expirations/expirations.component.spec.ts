import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsActivityComponent } from './expirations.component';

describe('CardsActivityComponent', () => {
  let component: CardsActivityComponent;
  let fixture: ComponentFixture<CardsActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

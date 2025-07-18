import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCardsComponent } from './my-services-and-taxes.component';

describe('MyCardsComponent', () => {
  let component: MyCardsComponent;
  let fixture: ComponentFixture<MyCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

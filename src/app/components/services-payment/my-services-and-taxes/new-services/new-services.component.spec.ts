import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewServiceComponent } from './new-services.component';

describe('FiltersComponent', () => {
  let component: NewServiceComponent;
  let fixture: ComponentFixture<NewServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

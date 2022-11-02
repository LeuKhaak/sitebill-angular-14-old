import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridComponent } from './grid.component';

xdescribe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClockCodePage } from './clock-code.page';

describe('ClockCodePage', () => {
  let component: ClockCodePage;
  let fixture: ComponentFixture<ClockCodePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClockCodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

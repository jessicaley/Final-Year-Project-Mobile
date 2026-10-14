import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeLogsPage } from './time-logs.page';

describe('TimeLogsPage', () => {
  let component: TimeLogsPage;
  let fixture: ComponentFixture<TimeLogsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeLogsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

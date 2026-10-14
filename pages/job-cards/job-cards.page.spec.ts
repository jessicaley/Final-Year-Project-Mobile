import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobCardsPage } from './job-cards.page';

describe('JobCardsPage', () => {
  let component: JobCardsPage;
  let fixture: ComponentFixture<JobCardsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JobCardsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

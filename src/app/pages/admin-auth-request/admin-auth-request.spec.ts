import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAuthRequest } from './admin-auth-request';

describe('AdminAuthRequest', () => {
  let component: AdminAuthRequest;
  let fixture: ComponentFixture<AdminAuthRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAuthRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAuthRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

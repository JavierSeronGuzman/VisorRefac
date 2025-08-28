import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AipromptComponent } from './aiprompt.component';

describe('AipromptComponent', () => {
  let component: AipromptComponent;
  let fixture: ComponentFixture<AipromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AipromptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AipromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

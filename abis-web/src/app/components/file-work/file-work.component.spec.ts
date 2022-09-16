import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileWorkComponent } from './file-work.component';

describe('FileWorkComponent', () => {
  let component: FileWorkComponent;
  let fixture: ComponentFixture<FileWorkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileWorkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

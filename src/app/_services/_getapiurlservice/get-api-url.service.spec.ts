import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GetApiUrlService} from './get-api-url.service';
import {StorageService} from '../storage.service';

// const fakeBitrix24Service = jasmine.createSpyObj('fakeBitrix24Service',
//   ['init_input_parameters', 'is_bitrix24_inited']);
// let storageService: any = '';
// beforeEach(() => {
//   TestBed.configureTestingModule({
//     providers: [
//       StorageService,
//       {provide: Bitrix24Service, useValue: fakeBitrix24Service},
//     ],
//   });
//   storageService = TestBed.inject(StorageService);
//   storageService.setItem('testItem', 'testValue');
// });

xdescribe('GetApiUrlService', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        GetApiUrlService
      ],
    }).compileComponents();
  });

  xit('should create the app', () => {
    const fixture = TestBed.createComponent(GetApiUrlService);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // xit(`should have as title 'sitebill-angular-14'`, () => {
  //   const fixture = TestBed.createComponent(GetApiUrlService);
  //   const app = fixture.componentInstance;
  //   expect(app.title).toEqual('sitebill-angular-14');
  // });

  xit('should render title', () => {
    const fixture = TestBed.createComponent(GetApiUrlService);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain('sitebill-angular-14 app is running!');
  });
});

import { DOWN_ARROW, ENTER, ESCAPE, SPACE, TAB, UP_ARROW } from '@angular/cdk/keycodes';
import { Component, DebugElement, NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchKeyboardEvent, MockNgZone } from 'ng-zorro-antd/core';
import { NzOptionComponent } from './nz-option.component';

import { OverlayContainer } from '@angular/cdk/overlay';
import { defaultFilterOption } from './nz-option.pipe';
import { NzSelectComponent } from './nz-select.component';
import { NzSelectModule } from './nz-select.module';

describe('nz-select component', () => {
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let zone: MockNgZone;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NzSelectModule, NoopAnimationsModule, FormsModule, ReactiveFormsModule],
      declarations: [
        NzTestSelectDefaultComponent,
        NzTestSelectTagsComponent,
        NzTestSelectFormComponent,
        NzTestOptionChangeComponent,
        NzTestSelectFormDisabledTouchedComponent
      ],
      providers: [
        {
          provide: NgZone,
          useFactory: () => {
            zone = new MockNgZone();
            return zone;
          }
        }
      ]
    });
    TestBed.compileComponents();
    inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    })();
  }));
  afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
    currentOverlayContainer.ngOnDestroy();
    overlayContainer.ngOnDestroy();
  }));
  describe('default', () => {
    let fixture: ComponentFixture<NzTestSelectDefaultComponent>;
    let testComponent: NzTestSelectDefaultComponent;
    let select: DebugElement;
    let selectComponent: NzSelectComponent;
    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestSelectDefaultComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      select = fixture.debugElement.query(By.directive(NzSelectComponent));
      selectComponent = select.injector.get(NzSelectComponent);
    });
    it('should className correct', () => {
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain('ant-select');
    });
    it('should size work', () => {
      testComponent.size = 'small';
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain('ant-select-sm');
      testComponent.size = 'large';
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain('ant-select-lg');
    });
    it('should allowClear work', () => {
      fixture.detectChanges();
      expect(select.nativeElement.classList).not.toContain('ant-select-allow-clear');
      testComponent.allowClear = true;
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain('ant-select-allow-clear');
    });
    it('should open work', () => {
      fixture.detectChanges();
      expect(select.nativeElement.classList).not.toContain('ant-select-open');
      testComponent.open = true;
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain('ant-select-open');
      expect(testComponent.openChange).toHaveBeenCalledTimes(0);
    });
    it('should click toggle open', () => {
      fixture.detectChanges();
      select.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      expect(testComponent.openChange).toHaveBeenCalledTimes(1);
      select.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.open).toBe(false);
      expect(testComponent.openChange).toHaveBeenCalledTimes(2);
    });
    it('should disabled work', fakeAsync(() => {
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain('ant-select-enabled');
      testComponent.disabled = true;
      fixture.detectChanges();
      expect(select.nativeElement.classList).not.toContain('ant-select-enabled');
      expect(select.nativeElement.classList).toContain('ant-select-disabled');
      expect(testComponent.openChange).toHaveBeenCalledTimes(0);
      select.nativeElement.click();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(testComponent.open).toBe(false);
      expect(testComponent.openChange).toHaveBeenCalledTimes(0);
    }));
    it('should focus and blur function work', () => {
      testComponent.showSearch = true;
      select.nativeElement.click();
      fixture.detectChanges();
      expect(select.nativeElement.querySelector('.ant-select-selection') === document.activeElement).toBe(true);
      selectComponent.blur();
      fixture.detectChanges();
      expect(select.nativeElement.querySelector('.ant-select-selection') === document.activeElement).toBe(false);
      selectComponent.focus();
      fixture.detectChanges();
      expect(select.nativeElement.querySelector('.ant-select-selection') === document.activeElement).toBe(true);
    });
    it('should dropdown class work', () => {
      fixture.detectChanges();
      select.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      expect(overlayContainerElement.querySelector('.test-class')).toBeDefined();
    });
    it('should dropdown style work', () => {
      fixture.detectChanges();
      select.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      const targetElement = overlayContainerElement.querySelector('.test-class') as HTMLElement;
      expect(targetElement.style.height).toBe('120px');
    });
    it('should dropdownMatchSelectWidth true work', fakeAsync(() => {
      fixture.detectChanges();
      select.nativeElement.click();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      zone.simulateZoneExit();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      const targetElement = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
      expect(targetElement.style.width).toBe('10px');
    }));
    it('should dropdownMatchSelectWidth false work', fakeAsync(() => {
      testComponent.dropdownMatchSelectWidth = false;
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      select.nativeElement.click();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      zone.simulateZoneExit();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      const targetElement = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
      expect(targetElement.style.width).toBe('');
      expect(targetElement.style.minWidth).toBe('10px');
    }));
    it('should custom template work', () => {
      select.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      fixture.detectChanges();
      overlayContainerElement.querySelector('li')!.click();
      fixture.detectChanges();
      zone.simulateZoneExit();
      fixture.detectChanges();
      const selection = select.nativeElement.querySelector('.ant-select-selection') as HTMLElement;
      expect(selection.textContent).toContain('Label: JackValue: jack');
    });
    it('should click option close dropdown', () => {
      testComponent.showSearch = true;
      select.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      fixture.detectChanges();
      overlayContainerElement.querySelector('li')!.click();
      fixture.detectChanges();
      expect(testComponent.open).toBe(false);
    });
    it('should keep overlay open when press esc', fakeAsync(() => {
      fixture.detectChanges();
      select.nativeElement.click();
      fixture.detectChanges();
      dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      select.nativeElement.click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      expect(selectComponent.cdkConnectedOverlay.overlayRef.backdropElement).toBeDefined();
    }));
    it('should keydown origin work', () => {
      const keyDownSpy = spyOn(selectComponent, 'onKeyDown');
      dispatchKeyboardEvent(select.nativeElement.querySelector('.ant-select-selection'), 'keydown', UP_ARROW);
      fixture.detectChanges();
      expect(keyDownSpy).toHaveBeenCalledTimes(1);
    });
    it('should blur after user hits enter key in single mode', () => {
      const spy = spyOn(selectComponent, 'blur');
      testComponent.showSearch = true;
      select.nativeElement.click();
      fixture.detectChanges();
      dispatchKeyboardEvent(select.nativeElement.querySelector('.ant-select-selection'), 'keydown', DOWN_ARROW);
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
      dispatchKeyboardEvent(select.nativeElement.querySelector('.ant-select-selection'), 'keydown', ENTER);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalled();
    });
    it('should support keydown events to open and close select panel', fakeAsync(() => {
      fixture.detectChanges();
      dispatchKeyboardEvent(select.nativeElement.querySelector('.ant-select-selection'), 'keydown', SPACE);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      // #2201, space should not close select panel
      dispatchKeyboardEvent(select.nativeElement.querySelector('.ant-select-selection'), 'keydown', TAB);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.open).toBe(false);
      dispatchKeyboardEvent(select.nativeElement.querySelector('.ant-select-selection'), 'keydown', DOWN_ARROW);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      dispatchKeyboardEvent(select.nativeElement.querySelector('.ant-select-selection'), 'keydown', TAB);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.open).toBe(false);
      testComponent.disabled = true;
      fixture.detectChanges();
      dispatchKeyboardEvent(select.nativeElement.querySelector('.ant-select-selection'), 'keydown', TAB);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.open).toBe(false);
    }));
    it('should skip disabled or hidden options on keydown events', fakeAsync(() => {
      fixture.detectChanges();
      select.nativeElement.click();
      fixture.detectChanges();
      overlayContainerElement.querySelector('li')!.click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.selectedValue).toBe('jack');
      select.nativeElement.click();
      fixture.detectChanges();
      dispatchKeyboardEvent(select.nativeElement.querySelector('.ant-select-selection'), 'keydown', UP_ARROW);
      fixture.detectChanges();
      dispatchKeyboardEvent(select.nativeElement.querySelector('.ant-select-selection'), 'keydown', ENTER);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.selectedValue).toBe('lucy');
      select.nativeElement.click();
      fixture.detectChanges();
      dispatchKeyboardEvent(select.nativeElement.querySelector('.ant-select-selection'), 'keydown', UP_ARROW);
      fixture.detectChanges();
      dispatchKeyboardEvent(select.nativeElement.querySelector('.ant-select-selection'), 'keydown', DOWN_ARROW);
      fixture.detectChanges();
      dispatchKeyboardEvent(select.nativeElement.querySelector('.ant-select-selection'), 'keydown', DOWN_ARROW);
      fixture.detectChanges();
      dispatchKeyboardEvent(select.nativeElement.querySelector('.ant-select-selection'), 'keydown', ENTER);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.selectedValue).toBe('jack');
    }));
  });
  describe('tags', () => {
    let fixture: ComponentFixture<NzTestSelectTagsComponent>;
    let testComponent: NzTestSelectTagsComponent;
    let select: DebugElement;
    let selectComponent: NzSelectComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestSelectTagsComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      select = fixture.debugElement.query(By.directive(NzSelectComponent));
      selectComponent = select.injector.get(NzSelectComponent);
    });
    it('should click option correct', fakeAsync(() => {
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain('ant-select');
      select.nativeElement.click();
      fixture.detectChanges();
      overlayContainerElement.querySelector('li')!.click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.selectedValue.length).toBe(1);
      expect(testComponent.selectedValue[0]).toBe('jack');
    }));
    it('should remove from top control work', fakeAsync(() => {
      fixture.detectChanges();
      selectComponent.nzSelectService.updateListOfSelectedValue(['jack'], true);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.selectedValue.length).toBe(1);
      expect(testComponent.selectedValue[0]).toBe('jack');
    }));
    it('should clear work', fakeAsync(() => {
      fixture.detectChanges();
      selectComponent.nzSelectService.updateListOfSelectedValue([], true);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.selectedValue.length).toBe(0);
    }));
    it('should custom display template work', fakeAsync(() => {
      fixture.detectChanges();
      selectComponent.nzSelectService.updateListOfSelectedValue(['jack'], true);
      fixture.detectChanges();
      tick(1000);
      flush();
      fixture.detectChanges();
      const selection = select.nativeElement.querySelector('.ant-select-selection') as HTMLElement;
      expect(selection.innerText).toContain('Label: Jack\nValue: jack');
    }));
  });

  describe('form', () => {
    let fixture: ComponentFixture<NzTestSelectFormComponent>;
    let testComponent: NzTestSelectFormComponent;
    let select: DebugElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestSelectFormComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      select = fixture.debugElement.query(By.directive(NzSelectComponent));
    });
    it('should set disabled work', fakeAsync(() => {
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(select.nativeElement.classList).not.toContain('ant-select-disabled');
      testComponent.disable();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain('ant-select-disabled');
    }));
    /** https://github.com/NG-ZORRO/ng-zorro-antd/issues/3014 **/
    it('should reset form works', fakeAsync(() => {
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.formGroup.value.select).toBe('jack');
      testComponent.reset();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.formGroup.value.select).toBe(null);
      select.nativeElement.click();
      fixture.detectChanges();
      overlayContainerElement.querySelector('li')!.click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.formGroup.value.select).toBe('jack');
      testComponent.reset();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.formGroup.value.select).toBe(null);
      select.nativeElement.click();
      fixture.detectChanges();
      overlayContainerElement.querySelector('li')!.click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.formGroup.value.select).toBe('jack');
    }));
  });

  describe('option change', () => {
    let fixture: ComponentFixture<NzTestOptionChangeComponent>;
    let testComponent: NzTestOptionChangeComponent;
    let select: DebugElement;
    let selectComponent: NzSelectComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestOptionChangeComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      select = fixture.debugElement.query(By.directive(NzSelectComponent));
      selectComponent = select.injector.get(NzSelectComponent)!;
    });

    it('should option change work', () => {
      fixture.detectChanges();
      const changeSpy = spyOn(selectComponent.nzSelectService, 'updateTemplateOption');
      fixture.detectChanges();
      expect(changeSpy).toHaveBeenCalledTimes(0);
      testComponent.displaySingle = true;
      fixture.detectChanges();
      expect(changeSpy).toHaveBeenCalledTimes(1);
      testComponent.displayGroup = true;
      fixture.detectChanges();
      expect(changeSpy).toHaveBeenCalledTimes(3);
      testComponent.displayGroupInner = true;
      fixture.detectChanges();
      expect(changeSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe('form init state', () => {
    let fixture: ComponentFixture<NzTestSelectFormDisabledTouchedComponent>;
    let testComponent: NzTestSelectFormDisabledTouchedComponent;
    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestSelectFormDisabledTouchedComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
    });
    /** https://github.com/NG-ZORRO/ng-zorro-antd/issues/3059 **/
    it('should init disabled state with touched false', fakeAsync(() => {
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.formGroup.controls.select.touched).toBe(false);
    }));
  });
});

@Component({
  template: `
    <nz-select
      style="width:10px;position: relative;display: block;"
      [nzSize]="size"
      [(ngModel)]="selectedValue"
      [nzAllowClear]="allowClear"
      (nzOpenChange)="openChange($event)"
      [nzDisabled]="disabled"
      [nzMode]="mode"
      [nzAutoClearSearchValue]="true"
      [nzServerSearch]="false"
      [nzShowSearch]="showSearch"
      [nzAutoFocus]="autoFocus"
      [(nzOpen)]="open"
      [nzMaxMultipleCount]="10"
      [compareWith]="compareWith"
      [nzFilterOption]="filterOption"
      [nzDropdownMatchSelectWidth]="dropdownMatchSelectWidth"
      [nzDropdownStyle]="dropdownStyle"
      [nzDropdownClassName]="'test-class'"
      [nzCustomTemplate]="custom"
      (nzOnSearch)="onSearch($event)"
      [nzPlaceHolder]="placeholder"
    >
      <nz-option nzValue="jack" nzLabel="Jack"></nz-option>
      <nz-option nzValue="lucy" nzLabel="Lucy"></nz-option>
      <nz-option nzValue="disabled" nzLabel="Disabled" nzDisabled></nz-option>
      <nz-option nzValue="hidden" nzLabel="Hidden" nzHide></nz-option>
      <nz-option nzValue="disabledAndHidden" nzLabel="DisabledAndHidden" nzDisabled nzHide></nz-option>
    </nz-select>
    <ng-template #custom let-selected>
      <div>Label: {{ selected.nzLabel }}</div>
      <div>Value: {{ selected.nzValue }}</div>
    </ng-template>
  `
})
export class NzTestSelectDefaultComponent {
  selectedValue = 'lucy';
  allowClear = false;
  open = false;
  size = 'default';
  mode = 'default';
  autoFocus = false;
  compareWith = (o1: any, o2: any) => o1 === o2; // tslint:disable-line:no-any
  disabled = false;
  onSearch = jasmine.createSpy('on search');
  showSearch = false;
  placeholder = 'placeholder';
  filterOption = defaultFilterOption;
  dropdownMatchSelectWidth = true;
  openChange = jasmine.createSpy('open change');
  dropdownStyle = { height: '120px' };
  nzFilterOption = (input: string, option: NzOptionComponent) => {
    if (option && option.nzLabel) {
      return option.nzLabel.toLowerCase().indexOf(input.toLowerCase()) > -1;
    } else {
      return false;
    }
  };
}

@Component({
  template: `
    <nz-select [(ngModel)]="selectedValue" [nzAllowClear]="true" [nzMode]="'tags'" [nzCustomTemplate]="custom">
      <nz-option nzValue="jack" nzLabel="Jack"></nz-option>
      <nz-option nzValue="lucy" nzLabel="Lucy"></nz-option>
      <nz-option nzValue="disabled" nzLabel="Disabled" nzDisabled nzCustomContent>Disabled</nz-option>
    </nz-select>
    <ng-template #custom let-selected>
      <div>Label: {{ selected.nzLabel }}</div>
      <div>Value: {{ selected.nzValue }}</div>
    </ng-template>
  `
})
export class NzTestSelectTagsComponent {
  selectedValue = ['lucy', 'jack'];
  allowClear = false;
}

@Component({
  template: `
    <form [formGroup]="formGroup">
      <nz-select nzShowSearch formControlName="select">
        <nz-option nzValue="jack" nzLabel="Jack"></nz-option>
        <nz-option nzValue="lucy" nzLabel="Lucy"></nz-option>
        <nz-option nzValue="disabled" nzLabel="Disabled" nzDisabled></nz-option>
      </nz-select>
    </form>
  `
})
export class NzTestSelectFormComponent {
  formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      select: ['jack']
    });
  }

  disable(): void {
    this.formGroup.disable();
  }

  reset(): void {
    this.formGroup.reset();
  }
}

@Component({
  template: `
    <form [formGroup]="formGroup">
      <nz-select formControlName="select">
        <nz-option nzValue="jack" nzLabel="Jack"></nz-option>
        <nz-option nzValue="lucy" nzLabel="Lucy"></nz-option>
      </nz-select>
    </form>
  `
})
export class NzTestSelectFormDisabledTouchedComponent {
  formGroup: FormGroup;

  constructor() {
    this.formGroup = new FormGroup({ select: new FormControl({ value: 'lucy', disabled: true }) });
  }
}

@Component({
  template: `
    <nz-select>
      <nz-option nzValue="lily" nzLabel="Lily" *ngIf="displaySingle"></nz-option>
      <nz-option-group nzLabel="Manager" *ngIf="displayGroup">
        <nz-option nzValue="jack" nzLabel="Jack" *ngIf="displayGroupInner"></nz-option>
        <nz-option nzValue="lucy" nzLabel="Lucy"></nz-option>
      </nz-option-group>
      <nz-option-group nzLabel="Engineer">
        <nz-option nzValue="Tom" nzLabel="tom"></nz-option>
      </nz-option-group>
    </nz-select>
  `
})
export class NzTestOptionChangeComponent {
  displaySingle = false;
  displayGroup = false;
  displayGroupInner = false;
}

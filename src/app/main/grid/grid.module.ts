import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {GridRoutingModule} from './grid-routing.module';
import { GridComponent } from './grid.component';
import { CommonTemplateComponent} from './common-template/common-template.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatBadgeModule} from '@angular/material/badge';
import {ReplacePipe} from '../../pipes/replace.pipe';
import {MatTooltipModule} from '@angular/material/tooltip';



@NgModule({
  declarations: [
    GridComponent,
    CommonTemplateComponent,
    ReplacePipe,
  ],
  imports: [
    CommonModule,
    GridRoutingModule,
    MatSidenavModule,
    NgxDatatableModule,
    MatIconModule,
    MatCheckboxModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  providers: [
  CommonTemplateComponent,
],
  entryComponents: [
  CommonTemplateComponent,
]
})
export class GridModule { }

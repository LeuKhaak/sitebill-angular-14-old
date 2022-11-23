import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {GridComponent} from './grid.component';


const gridRoutes: Routes = [
  {
    path: '',
    component: GridComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(gridRoutes)],
  exports: [RouterModule]
})
export class GridRoutingModule { }

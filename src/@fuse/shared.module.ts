import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  imports  : [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [

  ],
  exports  : [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class FuseSharedModule
{
}

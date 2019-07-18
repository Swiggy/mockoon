import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyFilterPipe } from './myFilterPipe';

@NgModule({
  declarations: [MyFilterPipe],
  imports: [
    CommonModule
  ],
  exports: [MyFilterPipe]
})
export class MainPipeModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
  {
    path: 'grid',
    loadChildren: () => import('src/app/main/grid/grid.module').then(m => m.GridModule)
  },
  {
    path: 'public',
    loadChildren: () => import('src/app/main/grid/grid.module').then(m => m.GridModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}

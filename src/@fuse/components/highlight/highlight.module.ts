import { NgModule } from '@angular/core';

import { FuseHighlightComponent } from '../../components/highlight/highlight.component';

@NgModule({
    declarations: [
        FuseHighlightComponent
    ],
    exports: [
        FuseHighlightComponent
    ],
})
export class FuseHighlightModule
{
}

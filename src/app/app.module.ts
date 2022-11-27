import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule} from './app.material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSnackBarModule} from '@angular/material/snack-bar'

import { AppRoutingModule } from './app-routing.module';
import {AppConfigModule} from './app.config.module';
import { AppComponent } from './app.component';
import {SnackBarComponent} from './main/snackbar/snackbar.component';

import {UiService} from './_services/ui.service';
import {StringParserService} from './_services/string-parser.service';
import {StorageService} from './_services/storage.service';
import {SnackService} from './_services/snack.service';
import {GetSessionKeyService} from './_services/get-session-key.service';
import {FilterService, FilterIterator} from './_services/filter.service';
import {ConfigService} from './_services/config.service';
import {AuthenticationService} from './_services/authentication.service';
import {ModelService} from './_services/_modelservice/model.service';
import {GetApiUrlService} from './_services/_getapiurlservice/get-api-url.service';
import {MatIconModule} from '@angular/material/icon';

import {FuseSharedModule} from '../@fuse/shared.module';
import {FuseModule} from '../@fuse/fuse.module';
// import {FuseProgressBarModule} from '../@fuse/components';
// import {FuseSidebarModule} from '../@fuse/components';
// import {FuseThemeOptionsModule} from '../@fuse/components';
import {fuseConfig} from './fuse-config';


@NgModule({
  declarations: [
    AppComponent,
    SnackBarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppConfigModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatIconModule,

    // Fuse modules
    FuseModule.forRoot(fuseConfig),
    //FuseProgressBarModule,
    FuseSharedModule,
    // FuseSidebarModule,
    // FuseThemeOptionsModule,

    // App modules
    // SharedModule,
  ],
  providers: [
    UiService,
    ModelService,
    StorageService,
    ConfigService,
    GetApiUrlService,
    GetSessionKeyService,
    AuthenticationService,
    FilterService,
    FilterIterator,
    SnackService,
    StringParserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

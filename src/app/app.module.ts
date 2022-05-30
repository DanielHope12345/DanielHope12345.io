import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { PlyrModule } from "ngx-plyr";
import { HttpClientModule} from "@angular/common/http"
import { LocationStrategy, PathLocationStrategy } from '@angular/common';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { LandingComponent } from './landing/landing.component';
import { RegistroComponent } from './registro/registro.component';
import { NetworkComponent } from './network/network.component';
import { FormsModule } from '@angular/forms';
import { DataTablesModule} from "angular-datatables";
import { GoogleMapsModule } from "@angular/google-maps";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { NoopAnimationsModule } from '@angular/platform-browser/animations'

import { MaterialExampleModule} from '../material.module'
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LandingComponent,
    RegistroComponent,
    NetworkComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PlyrModule,
    HttpClientModule,
    FormsModule,
    DataTablesModule,
    GoogleMapsModule,
    NgMultiSelectDropDownModule,
    NoopAnimationsModule,
    MaterialExampleModule
  ],
  exports:[
    PlyrModule,
    MatDatepickerModule
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'es-MX'},
    {provide: LocationStrategy, useClass: PathLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

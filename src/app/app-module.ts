import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { RegisterationModule } from './features/registeration/registeration-module';

@NgModule({
  declarations: [
    App,  // Keep only App component here
    // Removed HomeComponent from declarations here
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    RegisterationModule
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }

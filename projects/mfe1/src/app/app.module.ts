import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule} from "@angular/router";

import {AppComponent} from './app.component';
import {TodoModule} from './todo/todo.module';
import {HomeComponent} from './home/home.component';
import {APP_ROUTES} from "./app.routes";

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule,
        RouterModule.forRoot(APP_ROUTES),
        TodoModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {TodoComponent} from './todo.component';
import {TODO_ROUTES} from "./todo.routes";

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(TODO_ROUTES),
    ],
    declarations: [TodoComponent]
})
export class TodoModule {
}

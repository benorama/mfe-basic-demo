import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {TodoComponent} from './todo.component';

@NgModule({
    declarations: [TodoComponent],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: TodoComponent,
            },
        ]),
    ],
    exports: [
        TodoComponent
    ]
})
export class TodoModule {
}

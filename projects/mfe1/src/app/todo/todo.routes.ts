import {Routes} from '@angular/router';
import {TodoComponent} from "./todo.component";

export const TODO_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'todo',
        pathMatch: 'full'
    },
    {
        path: 'todo',
        component: TodoComponent
    }
];

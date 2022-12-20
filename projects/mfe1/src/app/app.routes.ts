import {Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';

export const APP_ROUTES: Routes = [
    {
        path: 'home',
        component: HomeComponent,
    },
    {
        path: 'todo-module',
        loadChildren: () => import('./todo/todo.module')
            .then(m => m.TodoModule)
    }
];

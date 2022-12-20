import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {loadRemoteModule} from '@angular-architects/module-federation';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        pathMatch: 'full',
    },
    {
        path: 'mfe1',
        loadChildren: () =>  loadRemoteModule({
            type: 'manifest',
            remoteName: 'mfe1',
            exposedModule: './TodoModule'
        }).then(m => m.TodoModule)
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}

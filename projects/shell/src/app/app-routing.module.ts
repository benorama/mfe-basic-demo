import {loadRemoteModule} from '@angular-architects/module-federation';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {environment} from "../environments/environment";

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        pathMatch: 'full',
    },
    {
        path: 'todo',
        loadChildren: () =>
            loadRemoteModule({
                type: 'module',
                remoteEntry: environment.mfe1RemoteEntryUrl,
                exposedModule: './Module'
            }).then(m => m.TodoModule)
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}

import {loadRemoteModule} from '@angular-architects/module-federation';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {Microfrontend} from "./microfrontends/microfrontend";

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        pathMatch: 'full',
    }
];

export function buildRoutes(options: Microfrontend[]): Routes {

    const lazyRoutes: Routes = options.map(o => ({
        path: o.routePath,
        loadChildren: () => loadRemoteModule(o).then(m => m[o.ngModuleName])
    }));

    return [...routes, ...lazyRoutes];
}

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}

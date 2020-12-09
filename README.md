# NEW APP

Source: https://www.angulararchitects.io/aktuelles/the-microfrontend-revolution-part-2-module-federation-with-angular/

Code: https://github.com/manfredsteyer/module-federation-plugin-example
https://github.com/manfredsteyer/module-federation-with-angular-dynamic

Create a new "nx-federated-workspace" workspace with two apps "shell" and "mfe1"

## Angular CLI

```
ng new mfe-demo --createApplication="false" --packageManager yarn
cd mfe-demo
ng generate application shell
ng generate application mfe1
```

## NX CLI

```
npx create-nx-workspace@latest nx-federated-workspace --preset="angular" --appName="shell" --style="scss"
ng g @nrwl/angular:app mfe1

nx g component my-component --project=mfe1 --classComponent
```

# WEBPACK CONFIG

## Add AngularAchitects module federation, for shell and mfe1

```
ng add @angular-architects/module-federation --project shell --port 5000
```

For shell app, it will :
1. update package.json to add @angular-architects/module-federation dependency (which provides ngx-build-plus)
2. generates default custom builder webpack.config.js 
3. update angular.json to replace "@angular-devkit/build-angular:" to "ngx-build-plus:"
4. update angular.json to assign specified ports
5. move main.ts content to bootstrap.ts and replace it with dynamic import `import('./bootstrap').catch(err => console.error(err));` to allow lazy loading of shared libraries like @angular/core, common or router (defined in webpack.config.js)

CREATE projects/shell/webpack.config.js (1267 bytes)
CREATE projects/shell/webpack.prod.config.js (46 bytes)
CREATE projects/shell/src/bootstrap.ts (372 bytes)
UPDATE angular.json (8036 bytes)
UPDATE projects/shell/src/main.ts (58 bytes)

Then, again for mfe1 app:

```
ng add @angular-architects/module-federation --project mfe1 --port 3000
```

CREATE projects/mfe1/webpack.config.js (1266 bytes)
CREATE projects/mfe1/webpack.prod.config.js (46 bytes)
CREATE projects/mfe1/src/bootstrap.ts (372 bytes)
UPDATE angular.json (8376 bytes)
UPDATE projects/mfe1/src/main.ts (58 bytes)


## If not done, add yarn package manager to cli in angular.json

```
ng config -g cli.packageManager yarn
```

## Add webpack resolution property in package.json to force the CLI into webpack 5

(e. g. before the dependencies section) 

```json
  "resolutions": {
    "webpack": "^5.4.0"
  },
```

## Install dependencies

```
yarn
```

# SHELL AND MFE1 APPS

## Create home component in shell and mfe1 app

```
ng generate component home --project=shell 
ng generate component home --project=mfe1  
```

## Add routing config in both app-routing.module.ts

```typescript
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  }
];
```

## Change default Shell and Mfe1 app.component.html

```html
<h1>Shell</h1>

<router-outlet></router-outlet>
```

```html
<h1>MFE1</h1>

<router-outlet></router-outlet>
```

## Run shell and check http://localhost:5000/ 

```
ng serve shell
```

## Run mfe1 and check http://localhost:3000/ 

```
ng serve mfe1
```

You can check in browser console the instance of `webpackChunkmfe1` which contains all the lazy loading chunk files, that you can also see in the console when starting the app:

```
Lazy Chunk Files                                                                                        | Names     |      Size
projects_mfe1_src_bootstrap_ts.js                                                                       | -         |   1.34 MB
node_modules_angular_core___ivy_ngcc___fesm2015_core_js.js                                              | -         |   1.29 MB
default-node_modules_angular_router___ivy_ngcc___fesm2015_router_js.js                                  | -         | 295.56 kB
default-node_modules_angular_common___ivy_ngcc___fesm2015_common_js.js                                  | -         | 231.01 kB
default-node_modules_rxjs__esm2015_internal_Subject_js-node_modules_rxjs__esm2015_internal_ob-3a8dfc.js | -         |  74.15 kB
```


# NEW TODO MODULE AND COMPONENTS IN MFE1 APP

## Create a Todo feature module

ng generate module Todo --project=mfe1
ng generate component todo --project=mfe1  

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TodoComponent } from './todo.component';

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
export class TodoModule { }
```

## Add TodoModule to mfe1/app.module.ts

```typescript
  imports: [
    BrowserModule,
    AppRoutingModule,
    TodoModule
  ],
```

## Add navigation in mfe1/app.component.html

```html
<h1>MFE1</h1>

<a routerLink="/">Home</a> | 
<a routerLink="/todo">Todo</a>

<router-outlet></router-outlet>
```

## Run mfe1 and check http://localhost:3000/ to see that "todo works!"

```
ng serve mfe1
```

# EXPOSES THE TODO MODULE FROM MFE1 "REMOTE" APP

## Add remote config in MFE1 ModuleFederationPlugin (apps/mfe1/webpack.config.js)

```json
    name: "mfe1",
    filename: "mfe1RemoteEntry.js",
    exposes: {
         './TodoModule': './projects/mfe1/src/app/todo/todo.module.ts',
    },
```

## Run the app

```
ng serve mfe1
```

You'll see the new mfe1RemoteEntry.js in the initial chunk files:

```
Initial Chunk Files                                                                                     | Names     |      Size
polyfills.js                                                                                            | polyfills | 167.07 kB
styles.js                                                                                               | styles    |  41.29 kB
mfe1RemoteEntry.js                                                                                | mfe1      |  28.86 kB
main.js                                                                                                 | main      |  28.38 kB
```

Note: right now, everything is loaded in mfe1RemoteEntry.js because of a bug that runtime chunk files.
This is linked to this webpack config option:

```json
optimization: {
    // Only needed to bypass a temporary bug
    runtimeChunk: false
  },
```

Once solved, mfe1RemoteEntry.js will be few kB and everything will be in a lazy chunk file.


# CONSUME THE TODO MODULE IN SHELL "HOST" APP

## Add host config in Shell ModuleFederationPlugin (apps/shell/webpack.config.js)

```json
    // Host config
    remotes: {
      "mfe1": "mfe1@http://localhost:3000/mfe1RemoteEntry.js",
    },
```

## Add new todo lazy remote route in shell app-routing.module.ts

```typescript
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'todo',
    loadChildren: () =>
      import('mfe1/TodoModule').then((m) => {
        return m.TodoModule;
      }),
  },
];
```

And add navigation to app component

```html
<h1>SHELL</h1>

<a routerLink="/">Home</a> | 
<a routerLink="/todo">Todo</a>

<router-outlet></router-outlet>
```

But if we try to run the app we'll get

```
Error: projects/shell/src/app/app-routing.module.ts:15:13 - error TS2307: Cannot find module 'mfe1/TodoModule' or its corresponding type declarations.
```

## A typing definition file for mfe1 module in apps/shell/src/app/mfe1.d.ts

"mfe1" comes from host config
"TodoModule" comes from remote config

```typescript
declare module 'mfe1/TodoModule'
```

Note: check that you have this in `tsconfig.app.json`

```
    "include": [
        "src/**/*.d.ts"
    ]
```

## Run mfe1 and check http://localhost:5000/ to see that "todo works!"

```
ng serve shell
```


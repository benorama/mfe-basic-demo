# NEW APP

Create a new "nx-federated-workspace" workspace with two apps "shell" and "mfe1"

## Angular CLI

```
ng new federated-demo-workspace --createApplication="false" --packageManager yarn
cd federated-demo-workspace
ng generate application shell
ng generate application mfe1
```

## NX CLI

```
npx create-nx-workspace@latest federated-demo-nx-workspace  --preset="angular" --appName="shell" --style="scss" --interactive=false --collection=@nrwl/workspace
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
2. generates default webpack.config.js 
3. update angular.json to replace "@angular-devkit/build-angular:" to "ngx-build-plus:"
4. update angular.json to use specific specified port
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

## Add webpack resolution property in angular.json

```
  "resolutions": {
    "webpack": "^5.0.0"
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

```
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  }
];
```

## Change default Shell and Mfe1 app.component.html

```
<h1>Shell</h1>

<router-outlet></router-outlet>
```

```
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

```
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

```
  imports: [
    BrowserModule,
    AppRoutingModule,
    TodoModule
  ],
```

## Add navigation in mfe1/app.component.html

```
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

```
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

```
optimization: {
    // Only needed to bypass a temporary bug
    runtimeChunk: false
  },
```

Once solved, mfe1RemoteEntry.js will be few kB and everything will be in a lazy chunk file.


# CONSUME THE TODO MODULE IN SHELL "HOST" APP

## Add host config in Shell ModuleFederationPlugin (apps/shell/webpack.config.js)

```
    // Host config
    remotes: {
      "mfe1": "mfe1@http://localhost:3000/mfe1RemoteEntry.js",
    },
```

## Add new todo lazy remote route in shell app-routing.module.ts

```
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

```
<h1>SHELL</h1>

<a routerLink="/">Home</a> | 
<a routerLink="/todo">Todo</a>

<router-outlet></router-outlet>
```

But if we try to run the app we'll get

```
Error: projects/shell/src/app/app-routing.module.ts:15:13 - error TS2307: Cannot find module 'mfe1/TodoModule' or its corresponding type declarations.
```

## A type definition file for mfe1 module in apps/shell/mfe1.d.ts

"mfe1" comes from host config
"TodoModule" comes from remote config

```
declare module 'mfe1/TodoModule'
```

## Run mfe1 and check http://localhost:5000/ to see that "todo works!"

```
ng serve shell
```

## PS1: Loading components instead of modules

It's also possible to directly load a component instead of a module by doing:

```
function getComponent() {
  return import('mfe1/TodoModule').then((m) => {
    return m.TodoComponent;
  });
}


const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'todo',
    component: await getComponent()
  },
];
```

But it requires change in tsconfig:

```
  "target": "es2017",
  "module": "esnext",
```

And webpack.config.js
```
  experiments: {
    topLevelAwait: true,
  },
```

## PS2: remote var

In webpack.config.js, yt's also possible to remove the hard-coded remote entry endpoint  

```
  // Host config
  remotes: {
    "mfe1": "mfe1", // Removed "mfe1@http://localhost:3000/mfe1RemoteEntry.js"
  },

```

Add directly add the remote entry endpoint in apps/shell/index.html

```
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Shell</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <script src="http://localhost:3000/mfe1RemoteEntry.js">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```


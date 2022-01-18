import {loadRemoteEntry} from '@angular-architects/module-federation';
import {environment} from './environments/environment';

Promise.all([
    loadRemoteEntry({ type: 'module', remoteEntry: environment.mfe1RemoteEntryUrl})
])
    .then(() => import('./bootstrap'))
    .catch(err => console.error('error', err));

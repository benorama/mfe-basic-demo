import {Injectable} from '@angular/core';
import {Microfrontend} from './microfrontend';
import {environment} from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LookupService {
    lookup(): Promise<Microfrontend[]> {
        return Promise.resolve([
            {
                // For Loading
                type: 'module',
                remoteEntry: environment.mfe1RemoteEntryUrl,
                exposedModule: './Module',

                // For Routing
                routePath: 'todo',
                ngModuleName: 'TodoModule'
            },
            // Add other MFE routes here
        ] as Microfrontend[]);
    }
}

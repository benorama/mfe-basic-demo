import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LookupService} from './microfrontends/lookup.service';
import {Microfrontend} from './microfrontends/microfrontend';
import {buildRoutes} from './app-routing.module';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    title = 'shell';
    microfrontends: Microfrontend[] = [];

    constructor(
        private router: Router,
        private lookupService: LookupService) {
    }

    async ngOnInit(): Promise<void> {
        this.microfrontends = await this.lookupService.lookup();
        const routes = buildRoutes(this.microfrontends);
        this.router.resetConfig(routes);
    }
}

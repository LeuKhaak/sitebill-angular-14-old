import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Injectable({
    providedIn: 'root'
})
export class FuseMatSidenavHelperService
{
    sidenavInstances: MatSidenav[];

    /**
     * Constructor
     */
    constructor()
    {
        this.sidenavInstances = [];
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set sidenav
     *
     * @param id
     * @param instance
     */
    setSidenav(id: number, instance: any): void // any ???
    {
        this.sidenavInstances[id] = instance;
    }

    /**
     * Get sidenav
     *
     * @param id
     * @returns {any}
     */
    getSidenav(id: number): any
    {
        return this.sidenavInstances[id];
    }
}

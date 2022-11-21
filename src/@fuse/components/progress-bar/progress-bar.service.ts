import { Injectable } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FuseProgressBarService
{
    // Private
    private _bufferValue: BehaviorSubject<number> | undefined;
    private _mode: BehaviorSubject<string> | undefined;
    private _value: BehaviorSubject<number> | undefined;
    private _visible: BehaviorSubject<boolean> | undefined;

    /**
     * Constructor
     *
     * @param {Router} _router
     */
    constructor(
        private _router: Router
    )
    {
        // Initialize the service
        this._init();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Buffer value
     */
    get bufferValue(): Observable<any> | undefined
    {
        if (!this._bufferValue) return;
        return this._bufferValue.asObservable();
    }

    setBufferValue(value: number): void
    {
        if (!this._bufferValue) return;
        this._bufferValue.next(value);
    }

    /**
     * Mode
     */
    get mode(): Observable<any> | undefined
    {
      if (!this._mode) return;
      return this._mode.asObservable();
    }

    setMode(value: 'determinate' | 'indeterminate' | 'buffer' | 'query'): void
    {
      if (!this._mode) return;
      this._mode.next(value);
    }

    /**
     * Value
     */
    get value(): Observable<any> | undefined
    {
      if (!this._value) return;
      return this._value.asObservable();
    }

    setValue(value: number): void
    {
      if (!this._value) return;
      this._value.next(value);
    }

    /**
     * Visible
     */
    get visible(): Observable<any> | undefined
    {
      if (!this._visible) return;
      return this._visible.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Initialize
     *
     * @private
     */
    private _init(): void
    {
        // Initialize the behavior subjects
        this._bufferValue = new BehaviorSubject(0);
        this._mode = new BehaviorSubject('indeterminate');
        this._value = new BehaviorSubject(0);
        this._visible = new BehaviorSubject(false);

        // Subscribe to the router events to show/hide the loading bar
        this._router.events
            .pipe(filter((event) => event instanceof NavigationStart))
            .subscribe(() => {
                this.show();
            });

        this._router.events
            .pipe(filter((event) => event instanceof NavigationEnd || event instanceof NavigationError || event instanceof NavigationCancel))
            .subscribe(() => {
                this.hide();
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Show the progress bar
     */
    show(): void
    {
      if (!this._visible) return;
      this._visible.next(true);
    }

    /**
     * Hide the progress bar
     */
    hide(): void
    {
      if (!this._visible) return;
      this._visible.next(false);
    }
}


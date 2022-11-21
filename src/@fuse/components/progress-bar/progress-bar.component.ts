import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseProgressBarService } from '../../components/progress-bar/progress-bar.service';

@Component({
    selector     : 'fuse-progress-bar',
    templateUrl  : './progress-bar.component.html',
    styleUrls    : ['./progress-bar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseProgressBarComponent implements OnInit, OnDestroy
{
    bufferValue = -1;
    mode = '';//  'determinate' | 'indeterminate' | 'buffer' | 'query';
    value = -1;
    visible = false;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {FuseProgressBarService} _fuseProgressBarService
     */
    constructor(
        private _fuseProgressBarService: FuseProgressBarService
    )
    {
        // Set the defaults

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to the progress bar service properties

        // Buffer value
      if (this._fuseProgressBarService && this._fuseProgressBarService.bufferValue) {
      this._fuseProgressBarService.bufferValue
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((bufferValue) => {
          this.bufferValue = bufferValue;
        });
    }

        // Mode
      if (this._fuseProgressBarService && this._fuseProgressBarService.mode) {
        this._fuseProgressBarService.mode
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((mode) => {
            this.mode = mode;
          });
      }

        // Value
      if (this._fuseProgressBarService && this._fuseProgressBarService.value) {
        this._fuseProgressBarService.value
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((value) => {
            this.value = value;
          });
      }

        // Visible
      if (this._fuseProgressBarService && this._fuseProgressBarService.visible) {
        this._fuseProgressBarService.visible
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((visible) => {
            this.visible = visible;
          });
      }

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

}

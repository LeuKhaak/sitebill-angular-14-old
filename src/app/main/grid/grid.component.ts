import { Component, OnInit } from '@angular/core';
import {ModelService} from '../../_services/_modelservice/model.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {
  rows_data = [];

  protected _unsubscribeAll: Subject<any>;

  constructor(
    public modelService: ModelService,
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.load_grid_data();
  }

  load_grid_data() { // TMP
    this.modelService.load("data", '', {load_collections: true, collections_domain: 'localhost', collections_deal_id: 1},
      '', 1, 21)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((result_f1: any) => {
          this.rows_data = result_f1.rows;
          console.log(this.rows_data);
        });
  }

}

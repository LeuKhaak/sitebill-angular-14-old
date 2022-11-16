import { Component, OnInit } from '@angular/core';
import { ModelService } from '../../_services/_modelservice/model.service';
import { Page } from './page';
import {
  SitebillEntity,
  SitebillModelItem,
} from '../../_models/sitebillentity';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent implements OnInit {
  rows_data = [];
  page = new Page();
  entity: SitebillEntity;
  loadingIndicator = false;
  protected _unsubscribeAll: Subject<any>;
  protected predefined_grid_fields = [];
  protected predefined_grid_params: { [index: string]: any } | null = {};

  constructor(public modelService: ModelService, private router: Router) {
    this._unsubscribeAll = new Subject();
    this.entity = new SitebillEntity();
  }

  ngOnInit(): void {
    // this.load_grid_data();
  }

  refresh() {
    this.modelService.set_current_entity(this.entity);
    this.setPage(1); // { offset: this.page.pageNumber }
  }

  setPage(pageInfo: number) {
    this.loadingIndicator = true;
    this.page.pageNumber = pageInfo;
    let params: { [index: string]: any } | null = {};
    if (this.entity.get_default_params()) {
      params = this.entity.get_default_params();
    } else if (this.get_predefined_grid_params() != null) {
      params = this.get_predefined_grid_params();
    }
    this.init_grid(params);
  }

  get_predefined_grid_params() {
    if (this.predefined_grid_params != null) {
      return this.predefined_grid_params;
    }
    return null;
  }

  init_grid(params: { [index: string]: any } | null) {
    let predefined_grid_fields = this.get_predefined_grid_fiels();
    if (predefined_grid_fields != null) {
      this.load_grid_data(
        this.entity.get_app_name(),
        predefined_grid_fields,
        params
      );
    } else {
      this.modelService
        .load_grid_columns(this.entity)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(
          (result: any) => {
            if (
              result.state == 'error' &&
              result.error == 'check_session_key_failed'
            ) {
              this.router.navigate(['/login']);
              return false;
            }
            if (result.data['meta'] != null) {
              if (result.data['meta']['per_page'] != null) {
                this.page.size = result.data['meta']['per_page'];
              }
            }
            this.load_grid_data(
              this.entity.get_app_name(),
              result.data['grid_fields'],
              params
            );
          },
          (err) => {
            console.log(err);
            this.router.navigate(['/login']);
            return false;
          }
        );
    }
  }

  get_predefined_grid_fiels() {
    if (this.predefined_grid_fields.length > 0) {
      return this.predefined_grid_fields;
    }
    return null;
  }

  load_grid_data(grid_columns: string, params: any) {
    let filter_params_json = this.get_filter_params();

    if (params != null) {
      Object.assign(filter_params_json, params);
    }

    let page_number = this.page.pageNumber + 1;

    let table_name = this.entity.get_table_name();
    if (!table_name) {
      table_name = this.entity.get_app_name();
    }

    this.modelService
      .load(
        table_name,
        grid_columns,
        filter_params_json,
        params.owner,
        page_number,
        this.page.size
      )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((result_f1: any) => {
        if (result_f1.state == 'error') {
          this.rise_error(result_f1.message);
        } else {
          this.entity.model = result_f1.columns;
          this.columns_index = result_f1.columns_index;
          this.rows_index = result_f1.rows_index;
          if (!this.freeze_default_columns_list) {
            this.entity.default_columns_list = result_f1.default_columns_list;
          }
          this.entity.columns_index = result_f1.columns_index;
          this.loadGridComplete = true;
          this.page.totalElements = result_f1.total_count;
          this.set_total_counter(result_f1.total_count);
          this.filterService.share_counter(
            this.entity,
            'total_count',
            result_f1.total_count
          );
          this.page.size = result_f1.per_page;

          if (this.get_predefined_grid_fiels() != null) {
            this.grid_columns_for_compose = this.get_predefined_grid_fiels();
          } else if (result_f1.grid_columns.grid_fields != null) {
            this.grid_columns_for_compose = result_f1.grid_columns.grid_fields;
          } else {
            this.grid_columns_for_compose = result_f1.default_columns_list;
          }

          this.grid_meta = result_f1.grid_columns.meta;
          let model_compose = this.entity.model;
          this.compose_columns(this.grid_columns_for_compose, model_compose);
          this.rows_data = result_f1.rows;
          this.data_all = result_f1.rows.length;
        }
        this.refresh_complete = true;
      });
  }

  get_filter_params() {
    let filter_params_json = {};
    let concatenate_search_string = null;

    if (this.filterService.get_params_count(this.entity.get_app_name()) > 0) {
      var obj = this.filterService.get_share_array(this.entity.get_app_name());
      var mapped = Object.keys(obj);
      var self = this;

      mapped.forEach(function (item, i, arr) {
        if (
          self.modelService.getConfigValue(
            'apps.realty.search_string_parser.enable'
          ) === '1' &&
          item === 'concatenate_search' &&
          self.entity.get_app_name() === 'data'
        ) {
          concatenate_search_string = obj[item];
        } else {
          if (obj[item] != null) {
            if (obj[item].length != 0) {
              filter_params_json[item] = obj[item];
            } else if (typeof obj[item] === 'object' && obj[item].length != 0) {
              filter_params_json[item] = obj[item];
            }
          }
        }
      });
    }

    if (this.enable_collections) {
      filter_params_json['load_collections'] = true;
      filter_params_json['collections_domain'] =
        this.bitrix24Service.get_domain();
      filter_params_json['collections_deal_id'] =
        this.bitrix24Service.get_entity_id();
      if (this.only_collections) {
        filter_params_json['only_collections'] = true;
        if (this.memorylist_id) {
          filter_params_json['memorylist_id'] = this.memorylist_id;
        }
      }
    }
    filter_params_json = this.extended_params(filter_params_json);
    if (concatenate_search_string !== null) {
      filter_params_json = {
        ...filter_params_json,
        ...self.parse_params_from_string(concatenate_search_string),
      };
    }
    return filter_params_json;
  }

  //load_grid_data() {
  //  // TMP
  //  this.modelService
  //    .load(
  //      'data',
  //      '',
  //      {
  //        load_collections: true,
  //        collections_domain: 'localhost',
  //        collections_deal_id: 1,
  //      },
  //      '',
  //      1,
  //      21
  //    )
  //    .pipe(takeUntil(this._unsubscribeAll))
  //    .subscribe((result_f1: any) => {
  //      this.rows_data = result_f1.rows;
  //      console.log(this.rows_data);
  //    });
  //}
}

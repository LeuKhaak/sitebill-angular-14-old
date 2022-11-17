import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { ModelService } from '../../_services/_modelservice/model.service';
import { FilterService } from 'src/app/_services/filter.service';
import { ConfigService } from 'src/app/_services/config.service';
import { GetSessionKeyService } from 'src/app/_services/get-session-key.service';
import { StringParserService } from 'src/app/_services/string-parser.service';
import { CommonTemplateComponent } from './common-template/common-template.component';
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
  grid_meta = [];
  page = new Page();
  entity: SitebillEntity;
  loadingIndicator = false;
  error = false;
  error_message = '';
  columns_index = [];
  rows_index = [];
  data_all = -1;
  refresh_complete = false;
  loadGridComplete = false;
  grid_columns_for_compose: string[] = [];
  data_columns: any[] = [];
  compose_complete = false;

  private params_filter = '';
  protected _unsubscribeAll: Subject<any>;
  protected predefined_grid_fields = [];
  protected predefined_grid_params: { [index: string]: any } | null = {};

  @ViewChild(CommonTemplateComponent)
  public commonTemplate: CommonTemplateComponent;

  @Input('freeze_default_columns_list')
  freeze_default_columns_list = false;

  @Input('enable_collections')
  enable_collections = false;

  @Input('only_collections')
  only_collections = false;

  @Input('memorylist_id')
  memorylist_id = -1;

  @Input('enable_select_rows')
  enable_select_rows = true;

  @Output() total_counterEvent = new EventEmitter<number>();

  constructor(
    public modelService: ModelService,
    private router: Router,
    public filterService: FilterService,
    public configService: ConfigService,
    public getSessionKeyService: GetSessionKeyService,
    protected stringParserService: StringParserService
  ) {
    this._unsubscribeAll = new Subject();
    this.entity = new SitebillEntity();
  }

  ngOnInit(): void {}

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
      this.load_grid_data(predefined_grid_fields, params);
    } else {
      this.modelService
        .load_grid_columns(this.entity)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: (v: any) => {
            if (v.state == 'error' && v.error == 'check_session_key_failed') {
              this.router.navigate(['/login']);
            }
            if (v.data['meta'] != null) {
              if (v.data['meta']['per_page'] != null) {
                this.page.size = v.data['meta']['per_page'];
              }
            }
            this.load_grid_data(v.data['grid_fields'], params);
          },
          error: (e) => {
            console.log(e);
            this.router.navigate(['/login']);
          },
        });
    }
  }

  get_predefined_grid_fiels() {
    if (this.predefined_grid_fields.length > 0) {
      return this.predefined_grid_fields;
    }
    return [];
  }

  load_grid_data(grid_columns: string[], params: any) {
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
          if (this.grid_columns_for_compose.length) {
            this.compose_columns(this.grid_columns_for_compose, model_compose);
          }
          this.rows_data = result_f1.rows;
          this.data_all = result_f1.rows.length;
        }
        this.refresh_complete = true;
      });
  }

  rise_error(message: string) {
    this.error = true;
    this.error_message = message;
  }

  set_total_counter(counter: number) {
    this.total_counterEvent.next(counter);
  }

  get_filter_params() {
    let filter_params_json: { [index: string]: any } = {};
    let concatenate_search_string = null;

    if (this.filterService.get_params_count(this.entity.get_app_name()) > 0) {
      var obj = this.filterService.get_share_array(this.entity.get_app_name());
      var mapped = Object.keys(obj);
      var self = this;

      mapped.forEach(function (item, i, arr) {
        if (
          self.configService.getConfigValue(
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
      // !!! bitrix24
      // filter_params_json['collections_domain'] =
      //  this.bitrix24Service.get_domain();
      // filter_params_json['collections_deal_id'] =
      //  this.bitrix24Service.get_entity_id();
      if (this.only_collections) {
        filter_params_json['only_collections'] = true;
        if (this.memorylist_id !== -1) {
          filter_params_json['memorylist_id'] = this.memorylist_id;
        }
      }
    }
    filter_params_json = this.extended_params(filter_params_json);
    if (concatenate_search_string !== null) {
      filter_params_json = {
        ...filter_params_json,
        ...this.parse_params_from_string(concatenate_search_string),
      };
    }
    return filter_params_json;
  }

  extended_params(params: { [index: string]: any }) {
    if (this.params_filter === 'my') {
      params['user_id'] = this.getSessionKeyService.get_user_id();
    }
    return params;
  }

  parse_params_from_string(input: string) {
    const parser_result = this.stringParserService.parse(input);
    return parser_result.params;
  }

  compose_columns(columns_list: string[], model: SitebillModelItem[]) {
    // delete this.data_columns;
    this.data_columns = [];
    // проходим по columns_list
    // для каждой вытягиваем из model информацию и добавляем в объект КОЛОНКИ
    if (this.enable_select_rows) {
      this.data_columns = [
        {
          cellTemplate: this.commonTemplate.gridCheckboxTmpl,
          headerTemplate: this.commonTemplate.gridCheckboxHdrTmpl,
          width: 30,
          type: 'primary_key',
          resizeable: false,
        },
      ];
    }

    this.data_columns.push(this.get_control_column());

    columns_list.forEach((row, index) => {
      if (this.columns_index[row] == null) {
        return;
      }
      this.entity.add_column(model[this.columns_index[row]].name);
      let cellTemplate = null;
      let prop = '';
      let width = 150;
      prop = model[this.columns_index[row]].name + '.value';
      if (this.grid_meta != null) {
        if (this.grid_meta['columns'] != null) {
          if (
            this.grid_meta['columns'][model[this.columns_index[row]].name] !=
            null
          ) {
            width =
              this.grid_meta['columns'][model[this.columns_index[row]].name]
                .width;
          }
        }
      }

      switch (model[this.columns_index[row]].type) {
        case 'safe_string':
          if (this.isMessengerEnabled(model[this.columns_index[row]])) {
            cellTemplate = this.commonTemplate.whatsAppTmpl;
          }
          break;

        case 'textarea':
        case 'textarea_editor':
          cellTemplate = this.commonTemplate.textTmpl;
          break;

        case 'dttime':
          cellTemplate = this.commonTemplate.dttimeTmpl;
          break;

        case 'dtdatetime':
          cellTemplate = this.commonTemplate.dtdatetimeTmpl;
          break;

        case 'dtdate':
          cellTemplate = this.commonTemplate.dtdateTmpl;
          break;

        case 'injector':
          cellTemplate = this.commonTemplate.injectorTmpl;
          break;

        case 'geodata':
          cellTemplate = this.commonTemplate.geoTmpl;
          prop = model[this.columns_index[row]].name + '.value_string';
          break;

        case 'checkbox':
          cellTemplate = this.commonTemplate.checkboxTmpl;
          break;

        case 'photo':
          cellTemplate = this.commonTemplate.photoTmpl;
          break;

        case 'price':
          cellTemplate = this.commonTemplate.priceTmpl;
          break;

        case 'uploads':
          cellTemplate = this.commonTemplate.imageTmpl;
          break;

        case 'select_by_query_multi':
          cellTemplate = this.commonTemplate.select_by_query_multi_Tmpl;
          break;

        default:
          if (this.isMessengerEnabled(model[this.columns_index[row]])) {
            cellTemplate = this.commonTemplate.whatsAppTmpl;
          } else {
            cellTemplate = null;
          }
          prop = model[this.columns_index[row]].name + '.value_string';
      }

      let column = {
        headerTemplate: this.get_header_template(),
        cellTemplate: cellTemplate,
        type: model[this.columns_index[row]].type,
        ngx_name: model[this.columns_index[row]].name + '.title',
        model_name: model[this.columns_index[row]].name,
        title: model[this.columns_index[row]].title,
        width: width,
        prop: prop,
      };
      this.data_columns.push(column);
    });
    this.after_compose();
    console.log(this.data_columns);
  }

  after_compose() {
    this.compose_complete = true;
    this.loadingIndicator = false;
  }
}

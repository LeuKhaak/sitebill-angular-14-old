import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ModelService} from '../../_services/_modelservice/model.service';
import {Subject} from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommonTemplateComponent} from './common-template/common-template.component';
import {SitebillEntity, SitebillModelItem} from '../../_models/sitebillentity';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {

  rows_data: any[] = [];
  data_columns: any[] = [];
  columns_index: any[] = [];
  grid_columns_for_compose: any[] = [];
  compose_complete = false;
  loadingIndicator = true;
  entity: SitebillEntity;

  protected _unsubscribeAll: Subject<any>;
  protected predefined_grid_fields: string[] = [];

  @ViewChild(CommonTemplateComponent)
  public commonTemplate: CommonTemplateComponent | undefined;

  @Input('disable_activation_button')
  disable_activation_button = false;

  @Input('enable_collections')
  enable_collections = false;

  @Input('only_collections')
  only_collections = false;

  @Input('memorylist_id')
  memorylist_id = -1;

  @Input('disable_menu')
  disable_menu = false;

  @Input('disable_add_button')
  disable_add_button = false;

  @Input('disable_header')
  disable_header = false;

  @Input('disable_wild_search')
  disable_wild_search = false;

  @Input('disable_view_button')
  disable_view_button = false;

  @Input('enable_coworker_button')
  enable_coworker_button = false;

  @Input('enable_testimonials_button')
  enable_testimonials_button = false;


  @Input('enable_building_blocks_button')
  enable_building_blocks_button = false;

  @Input('disable_edit_button')
  disable_edit_button = false;

  @Input('disable_delete_button')
  disable_delete_button = false;

  @Input('disable_refresh_button')
  disable_refresh_button = false;

  @Input('disable_gallery_controls')
  disable_gallery_controls = false;

  @Input('freeze_default_columns_list')
  freeze_default_columns_list = false;

  @Input('input_entity')
  input_entity: SitebillEntity;

  @Input('enable_select_rows')
  enable_select_rows = true;

  @Input('complaint_mode')
  complaint_mode = false;

  @Input('disable_fix_table_height')
  disable_fix_table_height = false;

  @Input('header_top_panel')
  header_top_panel = false;

  @Input('showFilterAllButton')
  showFilterAllButton = false;

  @Input('showFilterFilButton')
  showFilterFilButton = false;

  @Input('showFilterMyButton')
  showFilterMyButton = false;

  @Input('showFilterArhButton')
  showFilterArhButton = false;

  @Input('showFilterNewButton')
  showFilterNewButton = false;

  @Input('showFilterExButton')
  showFilterExButton = false;

  @Input('showFilterTemporarilyButton')
  showFilterTemporarilyButton = false;

  @Input('showSelectionButton')
  showSelectionButton = false;

  @Output() total_counterEvent = new EventEmitter<number>();

  constructor(
    public modelService: ModelService,
  ) {
    this._unsubscribeAll = new Subject();
    this.entity = new SitebillEntity();
    this.input_entity = new SitebillEntity();
  }

  ngOnInit(): void {
    this.load_grid_data()
  }

  load_grid_data() { // TMP
    // console.log('load_grid_data');
    // let filter_params_json = this.get_filter_params();
    //
    // if (params != null) {
    //   Object.assign(filter_params_json, params);
    // }
    //
    // let page_number = this.page.pageNumber + 1;
    // // console.log(filter_params_json);
    //
    // let table_name = this.entity.get_table_name();
    // if ( !table_name ) {
    //   table_name = this.entity.get_app_name();
    // }
    const  filter_params_json = { // TMP
      collections_deal_id: 1,
      collections_domain: "localhost",
      load_collections: true
    }

    // this.modelService.load(table_name, grid_columns, filter_params_json, params.owner, page_number, this.page.size)
    this.modelService.load('data', [''], filter_params_json, '', 1, 0)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((result_f1: any) => {
        // this.loadingIndicator = true;
        // console.log(result_f1);
        // if (result_f1.state == 'error') {
        //   this.rise_error(result_f1.message);
        // } else {
        //   // this.item_model = result.rows[0];
        //   this.entity.model = result_f1.columns;
        //   // this.item_model = result.columns;
          this.columns_index = result_f1.columns_index;
        //   this.rows_index = result_f1.rows_index;
        //   if ( !this.freeze_default_columns_list ) {
        //     this.entity.default_columns_list = result_f1.default_columns_list;
        //   }
          this.entity.columns_index = result_f1.columns_index;
        //   // console.log(this.item_model);
        //   this.loadGridComplete = true;
        //   this.page.totalElements = result_f1.total_count;
        //   this.set_total_counter(result_f1.total_count);
        //   this.filterService.share_counter(this.entity, 'total_count', result_f1.total_count);
        //   this.page.size = result_f1.per_page;
        //
        //   if (this.get_predefined_grid_fiels() != null) {
        //     this.grid_columns_for_compose = this.get_predefined_grid_fiels();
        //   } else
          if (result_f1.grid_columns.grid_fields != null) {
            this.grid_columns_for_compose = result_f1.grid_columns.grid_fields;
          } else {
            this.grid_columns_for_compose = result_f1.default_columns_list;
          }
        //
        //   this.grid_meta = result_f1.grid_columns.meta;
          let model_compose = this.entity.model;
          this.compose_columns(this.grid_columns_for_compose, model_compose);

          // console.log(this.item_model);
          this.rows_data = result_f1.rows;
          // this.data_all = result_f1.rows.length;
          // this.group();
          console.log("DATA", this.rows_data);


          // this.init_selected_rows(this.rows, selected);
          // this.loadingIndicator = false;
        // }
        //this.refresh_complete = true;
      });
  }

  // define_grid_fields(grid_fields: string[]) {  // unused
  //   if (grid_fields != null) {
  //     this.predefined_grid_fields = grid_fields;
  //   }
  // }

  // get_predefined_grid_fiels() {
  //   if (this.predefined_grid_fields.length > 0) {
  //     return this.predefined_grid_fields;
  //   }
  //   return null;
  // }

  get_control_column() {
    if (!this.commonTemplate) return;
    let control_column = {
      headerTemplate: this.commonTemplate.controlHdrTmpl,
      cellTemplate: this.commonTemplate.controlTmpl,
      width: 40,
      type: 'primary_key',
      ngx_name: this.entity.primary_key + '.title',
      model_name: this.entity.primary_key,
      title: '',
      prop: this.entity.primary_key + '.value'
    };
    return control_column;
  }

  compose_columns(columns_list: any[], model:SitebillModelItem[]) {
    // console.log('compose columns');
    // console.log(model);
    // console.log(model.length);
    // console.log(model[0]);
    console.log(columns_list);
    // console.log(this.columns_index);

    // if (this.compose_complete) {
    //   //return;
    // }
    this.data_columns = [];
    // проходим по columns_list
    // для каждой вытягиваем из model информацию и добавляем в объект КОЛОНКИ
    if (!this.commonTemplate) return;
    if ( this.enable_select_rows ) {
      this.data_columns = [{
        cellTemplate: this.commonTemplate.gridCheckboxTmpl,
        headerTemplate: this.commonTemplate.gridCheckboxHdrTmpl,
        width: 30,
        type: 'primary_key',
        resizeable: false,
      }];
    }
    // this.entity.add_column(model[this.columns_index[this.entity.primary_key]].name);

    this.data_columns.push(this.get_control_column());
    // console.log(this.grid_meta);
    if (columns_list) {
      columns_list.forEach((row, index) => {
        if (this.columns_index[row] == null) {
          return;
        }
        if (!model[this.columns_index[row]]) return;
        this.entity.add_column(model[this.columns_index[row]].name);
        let cellTemplate = null;
        let prop = '';
        let width = 150;
        prop = model[this.columns_index[row]].name + '.value';
        // if (this.grid_meta != null) {
        //   if (this.grid_meta['columns'] != null) {
        //     if (this.grid_meta['columns'][model[this.columns_index[row]].name] != null) {
        //       width = this.grid_meta['columns'][model[this.columns_index[row]].name].width;
        //       // console.log(model[this.columns_index[row]].name);
        //       // console.log(width);
        //     }
        //   }
        // }
        if (!this.commonTemplate) return;
        switch (model[this.columns_index[row]].type) {
          case 'safe_string':
            if (this.isMessengerEnabled(model[this.columns_index[row]])) {
              cellTemplate = this.commonTemplate.whatsAppTmpl;
            }
            break;

          case 'textarea':
          case 'textarea_editor':
            // console.log(model[this.columns_index[row]].name);
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
            // console.log(this.commonTemplate.select_by_query_multi_Tmpl);
            // console.log(row);
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
          prop: prop
        }
        this.data_columns.push(column);
      });
    }
    this.after_compose();
    // console.log(this.data_columns);
  }

  after_compose () {
    this.compose_complete = true;
    this.loadingIndicator = false;
  }

  get_header_template() {
    if (!this.commonTemplate) return;
    return this.commonTemplate.hdrTpl;
  }

  isMessengerEnabled ( modelItem: SitebillModelItem ) {
    if (
      modelItem.name === 'phone' ||
      (
        modelItem.parameters &&
        modelItem.parameters['messenger'] === '1'
      )
    ) {
      return true;
    }
    return false;
  }


}

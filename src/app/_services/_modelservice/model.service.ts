import { Injectable, Inject, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../../app.config.module';
import { UserProfile, CurrentUser } from '../../_models/currentuser';
import {
  ApiCall,
  SitebillEntity,
  SitebillModelItem,
} from '../../_models/sitebillentity';
import { Router } from '@angular/router';
// import { FuseConfigService } from '../../../@fuse/services/config.service';
import { FilterService } from '../filter.service';
import { StorageService } from '../storage.service';
import { ConfigService } from '../config.service';
import { GetApiUrlService } from '../_getapiurlservice/get-api-url.service';
import { GetSessionKeyService } from '../get-session-key.service';
import { Observable, Subject, timer } from 'rxjs';
import { SitebillSession } from '../../_models/sitebillsession';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class ModelService {
  private api_url = '';
  protected currentUser: CurrentUser;
  public entity: SitebillEntity;
  private current_user_profile: UserProfile;
  private sitebill_started = false;
  private current_entity: SitebillEntity;
  private navbar_hidden: boolean;
  private toolbar_hidden: boolean;

  @Output() config_loaded_emitter: EventEmitter<any> = new EventEmitter();
  @Output() sitebill_loaded_complete_emitter: EventEmitter<any> =
    new EventEmitter();
  @Output() need_reload_emitter: EventEmitter<any> = new EventEmitter();
  @Output() valid_user_emitter: EventEmitter<any> = new EventEmitter();
  @Output() init_permissions_complete_emitter: EventEmitter<any> =
    new EventEmitter();

  private install_mode: boolean;
  public init_permissions_complete = false;
  public init_config_complete = false;
  protected _unsubscribeAll: Subject<any>;

  constructor(
    private http: HttpClient,
    private router: Router,
    // protected _fuseConfigService: FuseConfigService,
    public storageService: StorageService,
    private filterService: FilterService,
    protected getApiUrlService: GetApiUrlService,
    protected getSessionKeyService: GetSessionKeyService,
    protected configService: ConfigService,
    @Inject(APP_CONFIG) private config: AppConfig
  ) {
    this._unsubscribeAll = new Subject();

    this.navbar_hidden = false;
    this.toolbar_hidden = false;
    this.entity = new SitebillEntity();
    this.entity.primary_key = '';
    this.entity.key_value = null;
    this.install_mode = false;
    this.currentUser = new CurrentUser();
    this.current_entity = new SitebillEntity();

    this.current_user_profile = new UserProfile();

    const user = this.storageService.getItem('currentUser');
    this.currentUser = JSON.parse(user) || new CurrentUser();
    const url = this.storageService.getItem('api_url');
    this.getApiUrlService.set_api_url(url);
  }

  get sitebill_session(): SitebillSession {
    return {
      sessionId: this.getSessionKeyService.get_session_key(),
      clientUrl:
        this.getApiUrlService.get_api_url() !== ''
          ? this.getApiUrlService.get_api_url()
          : window.location.protocol + '//' + window.location.hostname,
    };
  }

  onSitebillStart() {
    if (!this.sitebill_started) {
      this.configService.init_config(); // config
      this.init_permissions();
      this.sitebill_started = true;
    }
  }
  get_parser_api_url() {
    return 'https://www.etown.ru';
  }

  final_state() {
    if (this.init_config_complete && this.init_permissions_complete) {
      // config
      console.log('final_state true');
      return true;
    }
    return false;
  }

  is_logged_in() {
    if (
      this.getSessionKeyService.get_user_id() === null ||
      this.getSessionKeyService.get_user_id() === 0 ||
      this.getSessionKeyService.get_user_id() === undefined
    ) {
      return false;
    }
    return true;
  }

  load(
    model_name: string,
    grid_item: string[],
    filter_params_json: { [index: string]: any },
    owner: string,
    page: number,
    per_page: number
  ) {
    const body = {
      action: 'model',
      do: 'get_data',
      model_name: model_name,
      owner: owner,
      page: page,
      per_page: per_page,
      params: filter_params_json,
      session_key: this.getSessionKeyService.get_session_key_safe(),
      grid_item: grid_item,
    };
    // console.log(body);
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      body
    );
  }

  // Возвращаем только записи, которые используются в связанной таблице
  load_dictionary(columnName: string) {
    const request = {
      action: 'model',
      do: 'load_dictionary',
      columnName: columnName,
      anonymous: true,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      request
    );
  }

  // Возвращаем только записи, которые используются в связанной таблице
  load_dictionary_model(model_name: string, columnName: string, term = '') {
    const request = {
      action: 'model',
      do: 'load_dictionary',
      columnName: columnName,
      model_name: model_name,
      term: term,
      anonymous: true,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      request
    );
  }

  load_dictionary_model_with_params(
    model_name: string,
    columnName: string,
    params: { [index: string]: any },
    switch_off_ai_mode = false
  ) {
    const request = {
      action: 'model',
      do: 'load_dictionary_with_params',
      columnName: columnName,
      model_name: model_name,
      params: params,
      switch_off_ai_mode: switch_off_ai_mode,
      anonymous: true,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      request
    );
  }

  api_call(api_call: ApiCall, standard_params = {}) {
    let request = {
      action: api_call.name,
      do: api_call.method,
      params: api_call.params,
      anonymous: api_call.anonymous,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    request = { ...request, ...standard_params };
    console.log(request);
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      request
    );
  }
  async api_call_async(api_call: ApiCall, standard_params = {}) {
    return new Promise((resolve, reject) => {
      this.api_call(api_call, standard_params)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(
          (result) => {
            resolve(result);
          },
          (error) => {
            console.log(error);
            reject(new Error(error));
          }
        );
    });
  }

  api_request(request: any) {
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      request
    );
  }

  // Возвращает все записи
  load_dictionary_model_all(model_name: string, columnName: string) {
    const request = {
      action: 'model',
      do: 'load_dictionary',
      columnName: columnName,
      model_name: model_name,
      switch_off_ai_mode: true,
      anonymous: true,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      request
    );
  }

  get_max(model_name: string, columnName: string) {
    const request = {
      action: 'model',
      do: 'get_max',
      model_name: model_name,
      columnName: columnName,
      anonymous: true,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      request
    );
  }

  load_only_model(model_name: string, anonymous = false) {
    const load_data_request = {
      action: 'model',
      do: 'load_only_model',
      model_name: model_name,
      anonymous: anonymous ? 1 : '',
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      load_data_request
    );
  }

  loadByUri(model_name: string, entity_uri: string) {
    const load_data_request = {
      action: 'model',
      do: 'load_data',
      model_name: model_name,
      entity_uri: entity_uri,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      load_data_request
    );
  }

  loadById(
    model_name: string,
    primary_key: string,
    key_value: string,
    ql_items = null
  ) {
    // key_value: string | null
    const load_data_request = {
      action: 'model',
      do: 'load_data',
      model_name: model_name,
      primary_key: primary_key,
      key_value: key_value,
      ql_items: ql_items,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      load_data_request
    );
  }

  map_model(row_model: any) {
    type ArrayTypes = Record<string, any>;
    const good_model: ArrayTypes = [];
    Object.entries(row_model).forEach((key, value) => {
      good_model[key[0]] = new SitebillModelItem(key[1]);
    });
    return good_model;
  }

  native_insert(
    model_name: string,
    ql_items: { [index: string]: any },
    only_ql = null
  ) {
    const body = {
      action: 'model',
      do: 'native_insert',
      model_name: model_name,
      ql_items: ql_items,
      only_ql: only_ql,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      body
    );
  }

  native_update(
    model_name: string,
    key_value: string,
    ql_items: { [index: string]: any },
    only_ql = null
  ) {
    const body = {
      action: 'model',
      do: 'native_update',
      model_name: model_name,
      key_value: key_value,
      ql_items: ql_items,
      only_ql: only_ql,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      body
    );
  }

  update(
    model_name: string,
    key_value: string,
    ql_items: { [index: string]: any }
  ) {
    const body = {
      action: 'model',
      do: 'graphql_update',
      model_name: model_name,
      key_value: key_value,
      ql_items: ql_items,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      body
    );
  }

  update_only_ql(
    model_name: string,
    key_value: string,
    ql_items: { [index: string]: any }
  ) {
    const body = {
      action: 'model',
      do: 'graphql_update',
      model_name: model_name,
      only_ql: true,
      key_value: key_value,
      ql_items: ql_items,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      body
    );
  }

  update_column_meta(
    model_name: string,
    column_name: string,
    key: string,
    params: { [index: string]: any }
  ) {
    const body = {
      action: 'model',
      do: 'update_column_meta',
      model_name: model_name,
      column_name: column_name,
      key: key,
      params: params,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      body
    );
  }

  delete(model_name: string, primary_key: string, key_value: string) {
    const body = {
      action: 'model',
      do: 'delete',
      model_name: model_name,
      key_value: key_value,
      primary_key: primary_key,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      body
    );
  }

  report(
    model_name: string,
    primary_key: string,
    key_value: string,
    complaint_id: string
  ) {
    const body = {
      action: 'model',
      do: 'report',
      model_name: model_name,
      key_value: key_value,
      primary_key: primary_key,
      complaint_id: complaint_id,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      body
    );
  }

  save_search(params: { [index: string]: any }, search_title: string) {
    const body = {
      action: 'mysearch',
      do: 'save',
      params: params,
      search_title: search_title,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      body
    );
  }

  new_empty_record(model_name: string) {
    const body = {
      action: 'model',
      do: 'new_empty_record',
      model_name: model_name,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      body
    );
  }

  load_grid_columns(entity: SitebillEntity) {
    let body = {};
    body = {
      action: 'model',
      do: 'load_grid_columns',
      model_name: entity.get_table_name(),
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      body
    );
  }

  format_grid(entity: SitebillEntity, grid_items: string[], per_page: number) {
    let body = {};
    body = {
      action: 'model',
      do: 'format_grid',
      model_name: entity.get_table_name(),
      grid_items: grid_items,
      per_page: per_page,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      body
    );
  }

  uppend_uploads(
    model_name: string,
    key_name: string,
    key_value: string,
    field_name: string
  ) {
    let body = {};
    body = {
      action: 'model',
      do: 'uppend_uploads',
      model_name: model_name,
      primary_key: key_name,
      key_value: key_value,
      image_field: field_name,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      body
    );
  }

  toggle_collections(
    domain: string,
    deal_id: string,
    title: string,
    data_id: string,
    memorylist_id = 0
  ) {
    let body = {};
    body = {
      action: 'memorylist',
      do: 'toggle',
      domain: domain,
      deal_id: deal_id,
      memorylist_id: memorylist_id,
      title: title,
      data_id: data_id,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      body
    );
  }

  get_access(model_name: string, function_name: string) {
    const storage =
      JSON.parse(this.storageService.getItem('currentUser')) ||
      new CurrentUser();
    if (storage['structure'] == null) {
      return false;
    }
    if (storage['structure']['group_name'] === 'admin') {
      return true;
    }
    if (
      storage['structure'][model_name] === null ||
      storage['structure'][model_name] === undefined
    ) {
      return false;
    }
    if (storage['structure'][model_name][function_name] === 1) {
      return true;
    }
    return false;
  }

  get_models_list() {
    let body = {};
    body = {
      action: 'table',
      do: 'get_models_list',
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      body
    );
  }

  get_user_profile(user_id: string) {
    const load_data_request = {
      action: 'model',
      do: 'load_any_profile',
      user_id: user_id,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      load_data_request
    );
  }

  load_page(slug: string) {
    const load_data_request = {
      action: 'model',
      do: 'load_page',
      slug: slug,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      load_data_request
    );
  }

  get_current_user_profile() {
    return this.current_user_profile;
  }
  get_profile_img_url() {
    if (
      this.current_user_profile.imgfile.value != null &&
      this.current_user_profile.imgfile.value !== ''
    ) {
      return (
        this.getApiUrlService.get_api_url(true) +
        '/img/data/user/' +
        this.current_user_profile.imgfile.value
      );
    }
    return false;
  }

  export_collections_pdf(
    domain: string,
    deal_id: number,
    report_type: string = 'client',
    memorylist_id = null
  ) {
    const request = {
      action: 'pdfreport',
      do: 'export_collections_pdf',
      deal_id: deal_id,
      memorylist_id: memorylist_id,
      domain: domain,
      report_type: report_type,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      request,
      {
        responseType: 'blob',
      }
    );
  }

  excel_export(entity: SitebillEntity, input_params: { [index: string]: any }) {
    const request = {
      action: 'excelfree',
      do: 'export',
      model_name: entity.get_table_name(),
      input_params: input_params,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      request,
      {
        responseType: 'blob',
      }
    );
  }

  set_current_entity(entity: SitebillEntity) {
    this.current_entity = entity;
  }

  public init_permissions() {
    const request = {
      action: 'oauth',
      do: 'check_session_key',
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    this.http
      .post(`${this.getApiUrlService.get_api_url()}/apps/api/rest.php`, request)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((result: any) => {
        if (result.success === 1) {
          this.storageService.setItem('currentUser', JSON.stringify(result));
        }
        this.sitebill_loaded_complete_emitter.emit(true);
        this.init_permissions_complete_emitter.emit(true);
        this.init_permissions_complete = true;
      });
  }

  get_contact(contact_id: number) {
    const load_data_request = {
      action: 'model',
      model_name: 'contact',
      primary_key: 'id',
      do: 'get_contact',
      key_value: contact_id,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      load_data_request
    );
  }

  get_parser_today_count() {
    const load_data_request = {
      action: 'model',
      model_name: 'data',
      primary_key: 'id',
      do: 'get_today_count',
      session_key: 'nobody',
    };
    return this.http.post(
      `${this.get_parser_api_url()}/apps/api/rest.php`,
      load_data_request
    );
  }

  set_install_mode(mode: boolean) {
    this.install_mode = mode;
  }

  get_install_mode() {
    return this.install_mode;
  }

  toggle(
    component: string,
    model_name: string,
    primary_key: string,
    primary_key_value: string,
    toggled_column_name: string
  ): Observable<any> {
    const request = {
      action: component,
      do: 'toggle',
      model_name: model_name,
      primary_key: primary_key,
      primary_key_value: primary_key_value,
      toggled_column_name: toggled_column_name,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(
      `${this.getApiUrlService.get_api_url()}/apps/api/rest.php`,
      request
    );
  }

  OnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}

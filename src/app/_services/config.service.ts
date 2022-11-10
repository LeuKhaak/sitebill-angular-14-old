import {EventEmitter, Inject, Injectable, Output} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { APP_CONFIG, AppConfig } from '../app.config.module';
import { FuseConfigService } from '../../@fuse/services/config.service';
import {GetApiUrlService} from './get-api-url.service';
import {GetSessionKeyService} from './get-session-key.service';
import {UiService} from './ui.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Injectable()
export class ConfigService {
  private config_loaded = false;
  private sitebill_config: any;

  @Output() config_loaded_emitter: EventEmitter<any> = new EventEmitter();

  private dom_sitebill_config: any;
  public init_config_complete = false;
  protected _unsubscribeAll: Subject<any>;

  constructor(
    private http: HttpClient,
    private router: Router,
    protected getApiUrlService: GetApiUrlService,
    protected getSessionKeyService: GetSessionKeyService,
    protected _fuseConfigService: FuseConfigService,
    protected uiService: UiService,
    @Inject(APP_CONFIG) private config: AppConfig
  ) {
    this._unsubscribeAll = new Subject();
    this.sitebill_config = {};
    this.dom_sitebill_config = {};
  }

  // is_config_loaded()
  // init_config_standalone()
  // init_config()
  // after_config_loaded()

  system_config() {
    let body = {};
    body = {action: 'config', do: 'system_config', session_key: this.getSessionKeyService.get_session_key_safe()};
    return this.http.post(`${this.getApiUrlService.get_api_url()}/apps/api/rest.php`, body);
  }

  getConfigValue(key: string) {
    // config
    if (this.is_config_loaded()) {
      return this.sitebill_config[key];
    }
    return null;
  }

  getDomConfigValue(key: string) {
    // config
    return this.dom_sitebill_config[key];
  }

  setDomConfigValue(key: string, value: any) {
    // config
    return (this.dom_sitebill_config[key] = value);
  }

  setConfigValue(key: string, value: string) {
    // config
    this.sitebill_config[key] = value;
  }

  load_config() {
    // config ?
    // console.log(this.get_api_url());
    let body = {};
    body = {
      action: 'model',
      do: 'load_config',
      anonymous: true,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(`${this.getApiUrlService.get_api_url()}/apps/api/rest.php`, body);
  }

  load_config_anonymous() {
    // config ?
    // console.log(this.get_api_url());
    let body = {};
    body = {
      action: 'model',
      do: 'load_config',
      anonymous: true,
      session_key: '',
    };
    return this.http.post(`${this.getApiUrlService.get_api_url()}/apps/api/rest.php`, body);
  }

  update_system_config(ql_items: any) {
    // config
    let body = {};
    body = {
      action: 'config',
      do: 'update',
      ql_items: ql_items,
      session_key: this.getSessionKeyService.get_session_key_safe(),
    };
    return this.http.post(`${this.getApiUrlService.get_api_url()}/apps/api/rest.php`, body);
  }

  is_config_loaded() {
    // config
    return this.config_loaded;
  }

  init_config_standalone() {
    // config
    console.log('start init config standalone');
    this.load_config_anonymous()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (result: any) => {
          console.log('config standalone data loaded');
          if (result.state === 'success') {
            this.sitebill_config = result.data;
            this.config_loaded = true;
            this.config_loaded_emitter.emit(true);
          } else {
            console.log('load config failed');
          }
        },
        (error) => {
          console.log('load config failed, bad request standalone');
        }
      );
  }

  init_config() {
    this.load_config()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (result: any) => {
          // console.log('config data loaded');
          if (result.state === 'success') {
            this.sitebill_config = result.data;
            this.config_loaded = true;
            this.after_config_loaded();
          } else {
            console.log('load config failed');
            if (this.getSessionKeyService.is_model_redirect_enabled()) {
              this.router.navigate(['grid/data']);
            }
          }
        },
        (error) => {
          console.log('load config failed, bad request');
          this.config_loaded_emitter.emit(true);
          if (this.getSessionKeyService.is_model_redirect_enabled()) {
            this.router.navigate(['grid/data']);
          }
        }
      );
  }

  after_config_loaded() {
    this.config_loaded_emitter.emit(true);
    this.init_config_complete = true;
    if (this.getConfigValue('apps.realty.enable_navbar') === '1') {
      this.uiService.show_navbar();
    }
    if (this.getConfigValue('apps.realty.enable_toolbar') === '1') {
      this.uiService.show_toolbar();
    }

    if (
      this.getConfigValue('apps.realty.default_frontend_route') === null ||
      this.getConfigValue('apps.realty.default_frontend_route') === undefined
    ) {
      if (this.getSessionKeyService.is_model_redirect_enabled()) {
        this.router.navigate(['grid/data']);
      }
    } else {
      if (this.getSessionKeyService.is_model_redirect_enabled()) {
        this.router.navigate([
          this.getConfigValue('apps.realty.default_frontend_route'),
        ]);
      }
    }
  }

  OnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}

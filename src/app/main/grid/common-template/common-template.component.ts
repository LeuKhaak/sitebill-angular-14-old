import {
  Component,
  TemplateRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  Inject,
} from '@angular/core';
import { SitebillEntity } from 'src/app/_models/sitebillentity';
import { AppConfig, APP_CONFIG } from 'src/app/app.config.module';
import { ModelService } from 'src/app/_services/_modelservice/model.service';
import { GetApiUrlService } from 'src/app/_services/_getapiurlservice/get-api-url.service';
import {ConfigService} from '../../../_services/config.service';
// import {WhatsAppService} from "../../apps/whatsapp/whatsapp.service"; // TMP
import { takeUntil } from 'rxjs/operators';
import { SitebillResponse } from '../../../_models/sitebill-response';
import { Subject } from 'rxjs';


interface WhatsAppCheckStorage {
  [key: string]: any;
}

@Component({
  selector: 'common-template',
  templateUrl: './common-template.component.html',
  styleUrls: ['./common-template.component.scss'],
})
export class CommonTemplateComponent {
  api_url = '';
  protected _unsubscribeAll: Subject<any>;

  @ViewChild('gridCheckboxHdrTmpl') gridCheckboxHdrTmpl:
    | TemplateRef<any>
    | undefined;
  @ViewChild('gridCheckboxTmpl') gridCheckboxTmpl: TemplateRef<any> | undefined;
  @ViewChild('controlHdrTmpl') controlHdrTmpl: TemplateRef<any> | undefined;
  @ViewChild('controlTmpl') controlTmpl: TemplateRef<any> | undefined;
  @ViewChild('hdrTpl') hdrTpl: TemplateRef<any> | undefined;
  @ViewChild('imageTmpl') imageTmpl: TemplateRef<any> | undefined;
  @ViewChild('photoTmpl') photoTmpl: TemplateRef<any> | undefined;
  @ViewChild('whatsAppTmpl') whatsAppTmpl: TemplateRef<any> | undefined;
  @ViewChild('priceTmpl') priceTmpl: TemplateRef<any> | undefined;
  @ViewChild('geoTmpl') geoTmpl: TemplateRef<any> | undefined;
  @ViewChild('dtdatetimeTmpl') dtdatetimeTmpl: TemplateRef<any> | undefined;
  @ViewChild('dtdateTmpl') dtdateTmpl: TemplateRef<any> | undefined;
  @ViewChild('dttimeTmpl') dttimeTmpl: TemplateRef<any> | undefined;
  @ViewChild('textTmpl') textTmpl: TemplateRef<any> | undefined;
  @ViewChild('checkboxTmpl') checkboxTmpl: TemplateRef<any> | undefined;
  @ViewChild('clientControlTmpl') clientControlTmpl:
    | TemplateRef<any>
    | undefined;
  @ViewChild('clientIdTmpl') clientIdTmpl: TemplateRef<any> | undefined;
  @ViewChild('injectorTmpl') injectorTmpl: TemplateRef<any> | undefined;
  @ViewChild('FilterComponent') filterTmpl: TemplateRef<any> | undefined;
  @ViewChild('clientStatusIdTmpl') clientStatusIdTmpl:
    | TemplateRef<any>
    | undefined;
  @ViewChild('select_by_query_multi_Tmpl') select_by_query_multi_Tmpl:
    | TemplateRef<any>
    | undefined;

  template_loaded = false;
  @Input() entity = new SitebillEntity();

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

  @Input('disable_activation_button')
  disable_activation_button = false;

  @Input('disable_gallery_controls')
  disable_gallery_controls = false;

  @Input('complaint_mode')
  complaint_mode = false;

  @Output() viewEvent = new EventEmitter<number>();
  @Output() edit_formEvent = new EventEmitter<number>();
  @Output() deleteEvent = new EventEmitter<number>();
  @Output() reportEvent = new EventEmitter<number>();
  @Output() coworkersEvent = new EventEmitter<number>();
  @Output() testimonialsEvent = new EventEmitter<number>();
  @Output() building_blocksEvent = new EventEmitter<number>();
  @Output() toggle_activeEvent = new EventEmitter<any>();
  @Output() view_galleryEvent = new EventEmitter<any>();
  @Output() view_injectorEvent = new EventEmitter<any>();
  @Output() toggle_collectionEvent = new EventEmitter<any>();
  @Output() view_whatsappEvent = new EventEmitter<any>();

  private whatsAppCheckStorage: WhatsAppCheckStorage = {};

  constructor(
    // @Inject(APP_CONFIG) private config: AppConfig, // TMP
    public modelService: ModelService,
    protected getApiUrlService: GetApiUrlService, // protected whatsAppService: WhatsAppService, // TMP
    protected configService: ConfigService,
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.api_url = this.getApiUrlService.get_api_url();
  }

  view(item_id: number) {
    this.viewEvent.next(item_id);
  }

  toggle_active(row: { [index: string]: any }, value: any) {
    // ???? : any
    const event = { row: row, value: value };
    this.toggle_activeEvent.next(event);
  }

  toggle_collection(row: { [index: string]: any }, value: any) {
    // ???? : any
    const event = { row: row, value: value };
    this.toggle_collectionEvent.next(event);
  }

  view_injector(row: { [index: string]: any }, value: any) {
    // ???? : any
    const event = { row: row, value: value };
    this.view_injectorEvent.next(event);
  }

  valid_link(value: any) {
    // ???? : any
    const reg = '^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
    if (value.match(reg)) {
      return true;
    }
    return false;
  }

  view_gallery(
    row: { [index: string]: any },
    column: any,
    images: any,
    disable_gallery_controls: any
  ) {
    //???? : any
    const event = {
      row: row,
      column: column,
      images: images,
      disable_gallery_controls: disable_gallery_controls,
    };
    this.view_galleryEvent.next(event);
  }

  //view_whatsapp(row, column, value, history = false) { // TMP
  //  const event = { row: row, column: column, value: value, history: history };
  //  this.view_whatsappEvent.next(event);
  //}

  edit_form(item_id: number) {
    this.edit_formEvent.next(item_id);
  }

  delete(item_id: number) {
    this.deleteEvent.next(item_id);
  }

  report(item_id: number) {
    this.reportEvent.next(item_id);
  }

  coworkers(item_id: number) {
    this.coworkersEvent.next(item_id);
  }

  testimonials(item_id: number) {
    this.testimonialsEvent.next(item_id);
  }

  building_blocks(item_id: number) {
    this.building_blocksEvent.next(item_id);
  }

  get_status_class(row: { [index: string]: any }) {
    try {
      if (row['active'].value != '1') {
        return 'red-100';
      } else if (row['active'].value === '1') {
        return 'light-green-100';
      }
      if (row['hot'].value == 1) {
        return 'amber-100';
      }
    } catch {}
    return '';
  }

  get_permission(row: { [index: string]: any }, action: string) {
    if (
      row[this.entity.get_primary_key()] &&
      row[this.entity.get_primary_key()].permissions != null &&
      row[this.entity.get_primary_key()].permissions !== undefined
    ) {
      if (row[this.entity.get_primary_key()].permissions[action] === true) {
        return true;
      }
      return false;
    }
    return true;
  }

  //  isWhatsAppAvailable(value: string) { // TMP
  //    if (localStorage.getItem(value) != undefined) {
  //      if (localStorage.getItem(value) === '1') {
  //        return true;
  //      }
  //      return false;
  //    }

  //    if (!this.whatsAppService.readyState) {
  //      return false;
  //    }
  //    if (this.whatsAppCheckStorage[value] != undefined) {
  //      return this.whatsAppCheckStorage[value];
  //    }
  //    this.whatsAppCheckStorage[value] = false;

  //    /*
  //        this.whatsAppService.checkNumberStatus(value)
  //            .pipe(takeUntil(this._unsubscribeAll))
  //            .subscribe((result) => {
  //                if (result && result['numberExists']) {
  //                    console.log(value + ' numberExists');
  //                    localStorage.setItem(value, '1');
  //                    this.whatsAppCheckStorage[value] = true;
  //                } else {
  //                    localStorage.setItem(value, '0');
  //                    this.whatsAppCheckStorage[value] = false;
  //                }
  //            }, error => {
  //                console.log(error);
  //                this.whatsAppCheckStorage[value] = false;
  //            });
  //*/
  //    return false;
  //  }

  OnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}

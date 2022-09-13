import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { InstanceView, ReceiptView } from 'src/app/services/ApiService';
import { InstancesStore } from 'src/app/services/instances.store';
import { InstancesStoreService } from 'src/app/services/instances.store.service';

@UntilDestroy()
@Component({
  selector: 'app-receipt-add',
  templateUrl: './receipt-add.component.html',
  styleUrls: ['./receipt-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiptAddComponent implements OnInit {

  // Реактивная форма для поступления
  receiptForm!: FormGroup;
  isFormValid$ = new BehaviorSubject<boolean>(false);

  // Реактиваня форма для издания
  instanceForm!: FormGroup;
  isInstanceFormValid$ = new BehaviorSubject<boolean>(false);

  // Модели поступления и активного издания
  receipt = new ReceiptView();
  instanceActive = new InstanceView();

  // спиннеры загрузки
  isLoading$ = new BehaviorSubject<boolean>(false);
  isLoadingDelete$ = new BehaviorSubject<boolean>(false);

  // Хранилище
  instances$ = this.store.instances$;
  receiptId$ = this.store.receiptId$;
  receiptName$ = this.store.receiptName$;
  receiptCreatedDate$ = this.store.receiptDateCreated$;
  activeInstance$ = this.store.activeInstance$;
  activeId$ = this.store.activeId$;

  // Режим работы
  isWorkStatusOfReceiptIsEdit$ = new BehaviorSubject<boolean>(false);
  isWorkStatusOfActiveInstanceIsEdit$ = new BehaviorSubject<boolean>(false);

  // id поступления, записанное в маршрут
  id: string | undefined

  //Таблица с данными изданий
  tableOfInstances$ = new BehaviorSubject<InstanceView[]>([]);

  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private store: InstancesStore, // хранилище данных
    private storeService: InstancesStoreService // сервис для работы с хранилищем
  ) { }

  ngOnInit(): void {

    // заполняем таблицу изданиями
    this.instances$.subscribe(
      data => {
        this.tableOfInstances$.next(data);
      }
    )

      this.initReceiptForm();
      this.initInstanceForm();
      this.getInstances();

      // Следим за изменениями в форме поступлений
      this.receiptForm.statusChanges.pipe(untilDestroyed(this)).subscribe((status) => {
        switch(status) {
          case 'VALID':
            this.isFormValid$.next(true);
          break;
          case 'INVALID':
            this.isFormValid$.next(false);
          break;
        }
      });

      // Следим за изменениями в форме изданий
      this.instanceForm.statusChanges.pipe(untilDestroyed(this)).subscribe((status) => {
        switch(status) {
          case 'VALID':
            this.isInstanceFormValid$.next(true);
            break;
          case 'INVALID':
            this.isInstanceFormValid$.next(false);
            break;
        }
      });

  }

   // Реактивная форма поступления
   private initReceiptForm(): void {
    this.receiptForm = this.fb.group(
      {
        Name: [ null, [Validators.required] ],
        CreatedDate: [ null,  [Validators.required]]
      }
    );
  }

  // Реактивная форма издания
  private initInstanceForm(): void {
    this.instanceForm = this.fb.group(
      {
        Info: [null, [Validators.required]]
      }
    )
  }

  // Заполняем таблицу изданий и форму поступления
  getInstances() : void {
    
  }


  // Сохранить поступление
  saveReceipt() {
  }

  // Удалить строку издания
  deleteInstance(id: string) {

  }

  // режим редактировния Издания (клик по карандашу)
  editMode(id: string) {
    this.store.setActiveId(id); // определяем активный элемент

    // Вытаскиваем и распределяем данные из выбранного издания
    this.activeInstance$.subscribe(
      result => { 
        this.instanceActive.id = result?.id ?? '';
        this.instanceActive.info = result?.info;

        // Заполняем реактивную форму
        this.instanceForm.setValue({Info: result?.info});
      }
    )

    this.isWorkStatusOfActiveInstanceIsEdit$.next(true);
  }

  // Добавление новой строки издания
  addRowInstance(){

    this.instances$.subscribe(
      data => {
        const newRow = new InstanceView();
        newRow.info = "";
        const newList = [newRow].concat(data);
        this.tableOfInstances$.next(newList);

        // Заполняем реактивную форму
        // this.tableOfInstances$.subscribe(data =>{
        //   this.instanceForm.setValue({Info: data[0].info})
        // })
      }
    )
    this.isWorkStatusOfActiveInstanceIsEdit$.next(true);
  }

  // Перевод даты и времени в нужный формат
  private convertDateTime(date: Date) : string {
    let timeZone = (date.getTimezoneOffset()/60)*(-1);
    date.setTime(date.getTime() + (timeZone * 60)  * 60 * 1000);
    return date.toISOString().slice(0,16);
  }

}

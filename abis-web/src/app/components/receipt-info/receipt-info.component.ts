import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { InstanceView, ReceiptView } from 'src/app/services/ApiService';
import { 
  InstancesStore,
  InstancesStoreProvider
 } from 'src/app/services/instances.store';
import { InstancesStoreService } from 'src/app/services/instances.store.service';
import { Guid } from 'guid-ts';
import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { NgxSmartModalService } from 'ngx-smart-modal';
// для файликов
import { NzMessageService } from 'ng-zorro-antd/message';

// Интерфейс для фильтров
interface ColumnItem {
  name: string; // к какой колонке фильтр применяется
  sortOrder: NzTableSortOrder | null; // для сортировки столбца по умолчанию
  sortFn: NzTableSortFn<InstanceView> | null; // результат сортировки
  listOfFilter: NzTableFilterList; // это наверное список фильтров
  filterFn: NzTableFilterFn<InstanceView> | null; // определяет отфильтрованый результата
  filterMultiple: boolean; // указать является ли выбор множественным или одиночным
  sortDirections: NzTableSortOrder[]; // это вроде значки сортировки
}
@UntilDestroy()
@Component({
  selector: 'app-receipt-info',
  templateUrl: './receipt-info.component.html',
  styleUrls: ['./receipt-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InstancesStoreProvider, InstancesStoreService]
})
export class ReceiptInfoComponent implements OnInit {

  // Список столбцов для фильтров и сортировки
  listOfColumns: ColumnItem[] = [
    {
      name: 'Name',
      sortOrder: null,
      sortFn: (a: InstanceView, b: InstanceView) => a.info.localeCompare(b.info),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: (list: string[], item: InstanceView) => list.some(name => item.info?.indexOf(name) !== -1)
    },
  ];

  // Реактивная форма для поступления
  receiptForm!: FormGroup;
  isFormValid$ = new BehaviorSubject<boolean>(false);

  // Реактиваня форма для издания
  instanceForm!: FormGroup;
  isInstanceFormValid$ = new BehaviorSubject<boolean>(false);

  // Модели поступления и активного издания
  receipt = new ReceiptView();
  instanceActive = new InstanceView();

  isLoading$ = this.store.isSaveLoading$;  // спиннер загрузки
  isLoadingDelete$ = new BehaviorSubject<boolean>(false);

  // Хранилище
  instances$ = this.store.instances$;
  receiptId$ = this.store.receiptId$;
  receiptName$ = this.store.receiptName$;
  receiptCreatedDate$ = this.store.receiptDateCreated$;
  activeInstance$ = this.store.activeInstance$;
  activeId$ = this.store.activeId$;

  isLoading: boolean = false;  //блокировка кнопок при загрузке данных в бд или ее отмене
  isEditMode: boolean = false; //режим редактирования

  // Режим работы для активного издания
  isWorkStatusOfActiveInstanceIsEdit$ = new BehaviorSubject<boolean>(false);

  // id поступления, записанное в маршрут
  receiptIdFromUrl: string | undefined

  // для управления таблицей
  pageIndex: number = 1;
  total: number = 2;
  pageSize: number = 5;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: InstancesStore, // хранилище данных
    private storeService: InstancesStoreService, // сервис для работы с хранилищем
    public ngxSmartModalService: NgxSmartModalService,
    private msg: NzMessageService
  ) { }

  ngOnInit(): void {

    // отслеживаем работу combineLatest для определения выгрузки данных
    this.store.isLoading.subscribe(data=>{
      if(data){
        this.isLoading = true;
      }else{
        this.isLoading = false;
      }
    });
    // отслеживаем работу combineLatest для определения статуса работы с карточкой
    this.store.isEditWorkStatus.subscribe(data=>{
      if(data){
        this.isEditMode = true;
      }else{
        this.isEditMode = false;
      }
    })

    // пока не придумала как по-другому присваивать свойствц total значение данных
     this.instances$.subscribe((res) => {
       console.log(`Данные изменились: `, res);

       this.total = res.length;
     });

    // следим в каком поступлении мы находимся    
    this.route.params.pipe(untilDestroyed(this)).subscribe(
      params =>  this.receiptIdFromUrl = params['id']
    );

      this.initReceiptForm();
      this.initInstanceForm();
      this.getInfoAboutRecieptAndInstances();

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
  private getInfoAboutRecieptAndInstances() : void {
    // получили список изданий (тут переделать надо)
    this.storeService.getInstances(this.receiptIdFromUrl).pipe(untilDestroyed(this)).subscribe({
      next: result => {
        // Сохраняем информацию о поступлении в модель данных
        this.receipt.id = result.id;
        this.receipt.name = result.name;
        this. receipt.createdDate = result.createdDate;

        // Инициализируем форму поступления
         this.receiptForm.setValue({
           Name: result.name,
           CreatedDate: this.convertDateTime(result.createdDate)
        });
      }});
  }

  // Сохранить издание/Добавить издание
  saveChangesInstance(id: string) {

    this.isWorkStatusOfActiveInstanceIsEdit$.next(false);
    this.store.isWorkStatusOfActiveInstanceIsEdit$.next(false);

    // режим добавления нового элемента
    if(id == undefined){
      //сначала удалим пустой элемент
      this.store.deleteInstance(id);

      // сохраним даные из формы в модель и добавим новое издание
      this.instanceActive.id = Guid.newGuid().toString();
      this.instanceActive.info = this.instanceForm.value.Info;
      this.instanceActive.recieptId = this.receiptIdFromUrl;

      // Добавим издание в хранилище
      this.storeService.addNewInstance(this.instanceActive);
    }else{
      // режим редактирования существующей записи

      this.instanceActive.id = id;
      this.instanceActive.info = this.instanceForm.value.Info;
      this.instanceActive.recieptId = this.receiptIdFromUrl;

      this.storeService.saveNewInstance(this.instanceActive);
    }

    // Отчистим модель данных
    this.instanceActive = new InstanceView();
    // отчищаем форму
    this.instanceForm.patchValue({
      Info: this.instanceActive.info
    });
    
    this.store.resetActiveId(); // сбросить активный id
  }

  // Отмена изменений для изданий
  stopChangesInstance(id: string) {
    this.isWorkStatusOfActiveInstanceIsEdit$.next(false);
    this.store.isWorkStatusOfActiveInstanceIsEdit$.next(false);

    // отчистим строку, если пользователь передумал добавлять издание
    if(id == undefined){
      // обновление хранилища
      this.store.deleteInstance(id);
    }else{
      // выберем активный элемент
      this.store.setActiveId(id);

      this.activeInstance$.subscribe(
        result => { 
          this.instanceActive.id = result?.id ?? '';
          this.instanceActive.info = result?.info ?? "";

          // Заполняем реактивную форму
          this.instanceForm.setValue({Info: result?.info});
        }
      )
    }

     // отчищаем форму
     this.instanceForm.setValue({Info: ''});

     this.instanceActive = new InstanceView(); //отчищаем модель данных

     this.store.resetActiveId(); // сбросить активный id
  }

  // Удалить издание из эльфа
  deleteInstance(id: string){
    this.store.isWorkStatusOfReceiptIsEdit$.next(true);

    this.store.setActiveId(id); // определяем активный элемент
    this.storeService.deleteInctance(id);
    this.store.resetActiveId(); // сбрасываем активный элемент
  }

  // режим редактировния Издания (клик по карандашу)
  editMode(id: string) {
    this.store.setActiveId(id); // определяем активный элемент

    // Вытаскиваем и распределяем данные из выбранного издания
    this.activeInstance$.subscribe(
      result => { 
        this.instanceActive.id = result?.id ?? '';
        this.instanceActive.info = result?.info ?? '';

        // Заполняем реактивную форму
        this.instanceForm.setValue({Info: result?.info});
      }
    )
    this.store.isWorkStatusOfReceiptIsEdit$.next(true);
    this.isWorkStatusOfActiveInstanceIsEdit$.next(true);
    this.store.isWorkStatusOfActiveInstanceIsEdit$.next(true);
  }

  // Режим редактирования поступления
  editModeReceipt() : void {
    this.store.isWorkStatusOfReceiptIsEdit$.next(true);
  }

  // добавление строки в таблицу изданий
  addRowInstance(){
    const newRow = new InstanceView();
    this.storeService.addNewInstance(newRow);

    this.isWorkStatusOfActiveInstanceIsEdit$.next(true);
    this.store.isWorkStatusOfActiveInstanceIsEdit$.next(true);

    this.store.isWorkStatusOfReceiptIsEdit$.next(true);
    //перебросим пользователя к странице тблицы с добавлением элемента
    this.pageIndex = this.total;
  }

  // Сохранить изменения
  saveChanges(){
    this.store.isSaveLoading$.next(true);

    // из формы поступления сохраним информацию в эльф
    this.receipt.id = this.receiptIdFromUrl ?? '';
    this.receipt.createdDate = new Date(this.receiptForm.value.CreatedDate);
    this.receipt.name = this.receiptForm.value.Name;

    this.storeService.saveNewReceipt(this.receipt);

    // тут лезем в бд через сервис эльфа, чтобы обновить данные
    this.storeService.saveChangeOfReceipt().pipe(untilDestroyed(this)).subscribe(
      {
        next: data => {
          if(data){
            //возвращаемся на страницу поступлений
            this.router.navigate(['receipts']);
          }else{
            alert("Что - то пошло не так");
          }
        },
        error:()=>{},
        complete:()=>{
          this.store.isSaveLoading$.next(false);
          this.store.isWorkStatusOfReceiptIsEdit$.next(false);
        }
      }
      
    )
  }

  // Отменить изменения
  cancleChanges(){
    this.isWorkStatusOfActiveInstanceIsEdit$.next(false);
    this.store.isWorkStatusOfActiveInstanceIsEdit$.next(false);

    this.store.isWorkStatusOfReceiptIsEdit$.next(false);

    // отчищаем хранилище
    this.store.deleteEntities();
    // отчищаем свойства
    this.store.setNewProps('', '', new Date());
    // тут лезем в бд через сервис эльфа, чтобы восстановить данные
    this.getInfoAboutRecieptAndInstances();

    this.ngxSmartModalService.getModal("cancelChanges").close();
  }

  //-------------Файлы-----------------------

  // Перевод даты и времени в нужный формат
  private convertDateTime(date: Date) : string {
    let timeZone = (date.getTimezoneOffset()/60)*(-1);
    date.setTime(date.getTime() + (timeZone * 60)  * 60 * 1000);
    return date.toISOString().slice(0,16);
  }
}

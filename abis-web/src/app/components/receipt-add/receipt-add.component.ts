import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Guid } from 'guid-ts';
import { BehaviorSubject} from 'rxjs';
import { InstanceView, ReceiptView } from 'src/app/services/ApiService';
import { 
  InstancesStore,
  InstancesStoreProvider
 } from 'src/app/services/instances.store';
import { InstancesStoreService } from 'src/app/services/instances.store.service';
import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { NgxSmartModalService } from 'ngx-smart-modal';


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
  selector: 'app-receipt-add',
  templateUrl: './receipt-add.component.html',
  styleUrls: ['./receipt-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InstancesStoreProvider, InstancesStoreService]
})
export class ReceiptAddComponent implements OnInit {

  // Список столбцов
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

  // Хранилище
  instances$ = this.store.instances$;
  // receiptId$ = this.store.receiptId$;
  // receiptName$ = this.store.receiptName$;
  // receiptCreatedDate$ = this.store.receiptDateCreated$;
  receipt$ = this.store.receipt$;

  activeInstance$ = this.store.activeInstance$;
  activeId$ = this.store.activeId$;

  isLoading: boolean = false;  //блокировка кнопок при загрузке данных в бд или ее отмене

  // Режим работы с изданиями при добавлении
  isWorkStatusOfActiveInstanceIsEdit$ = new BehaviorSubject<boolean>(false);

  // для управления таблицей
  pageIndex: number = 1;
  total: number = 2;
  pageSize: number = 5;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private store: InstancesStore, // хранилище данных
    private storeService: InstancesStoreService, // сервис для работы с хранилищем
    public ngxSmartModalService: NgxSmartModalService
  ) { }

  ngOnInit(): void {

    this.store.isLoading.subscribe(data=>{
      if(data){
        this.isLoading = true;
      }else{
        this.isLoading =false;
      }
    });

    this.instances$.subscribe(
      (res) => {
        console.log(`Данные изменились: `, res);
        this.total = res.length;
      }
    );
    

    this.initReceiptForm();
    this.initInstanceForm();

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

  // Сохранить поступление
  saveReceipt() {

    this.store.isSaveLoading$.next(true);

    // из формы поступления сохраним информацию в эльф
    this.receipt.id = Guid.newGuid().toString();
    this.receipt.createdDate = new Date(this.receiptForm.value.CreatedDate);
    this.receipt.name = this.receiptForm.value.Name;

    this.storeService.saveNewReceipt(this.receipt);

    this.storeService.addNewReceipt().pipe(untilDestroyed(this)).subscribe(
      {
        next:(data)=>{
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
        }
      }
    )
  }

  // Сохранить издание/Добавить издание
  saveChangesInstance(id: string) {

    this.isWorkStatusOfActiveInstanceIsEdit$.next(false);

    // режим добавления нового элемента
    if(id == undefined){
      //сначала удалим пустой элемент
      this.store.deleteInstance(id);

      // сохраним даные из формы в модель и добавим новое издание
      this.instanceActive.id = Guid.newGuid().toString();
      this.instanceActive.info = this.instanceForm.value.Info;

      // Добавим издание в хранилище
      this.storeService.addNewInstance(this.instanceActive);
    }else{
      // режим редактирования существующей записи

      this.instanceActive.id = id;
      this.instanceActive.info = this.instanceForm.value.Info;

      this.storeService.saveNewInstance(this.instanceActive);
    }

    // Отчистим модель данных
    this.instanceActive = new InstanceView();
    this.store.resetActiveId(); // сбросить активный id
    // отчищаем форму
    this.instanceForm.setValue({Info: ''});
  }

  // Отмена изменений для изданий
  stopChangesInstance(id: string) {
    this.isWorkStatusOfActiveInstanceIsEdit$.next(false);

    // отчистим строку, если пользователь передумал добавлять издание
    if(id == undefined){
      this.store.deleteInstance(id);
    }else{
      // выберем активный элемент
      this.store.setActiveId(id);

      this.activeInstance$.subscribe(
        result => { 
          this.instanceActive.id = result?.id ?? '';
          this.instanceActive.info = result?.info ?? '';

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

  // Удалить строку издания
  deleteInstance(id: string) {
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

    this.isWorkStatusOfActiveInstanceIsEdit$.next(true);
  }

  // Добавление новой строки издания
  addRowInstance(){
    const newRow = new InstanceView();
    this.storeService.addNewInstance(newRow);
    this.isWorkStatusOfActiveInstanceIsEdit$.next(true);
    
    this.pageIndex = this.total;
  }

  // Отменить создание поступления
  CancelAddReceipt(){
    //возвращаемся на страницу поступлений
    this.router.navigate(['receipts']);
  }
}

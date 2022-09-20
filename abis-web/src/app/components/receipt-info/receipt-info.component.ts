import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { FilesForReceiptsView, InstanceView, ReceiptView } from 'src/app/services/ApiService';
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
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { FileService } from 'src/app/services/file-service/file.service';

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

  // Реактивная форма для файла
  fileForm!: FormGroup;
  isFileFormValid$ = new BehaviorSubject<boolean>(false);

  // Модели поступления, активного издания и активного файла
  receipt = new ReceiptView();
  instanceActive = new InstanceView();
  fileActive = new FilesForReceiptsView();

  isLoading$ = this.store.isSaveLoading$;  // спиннер загрузки
  isLoadingDelete$ = new BehaviorSubject<boolean>(false);

  // Хранилище
  instances$ = this.store.instances$;
  receiptId$ = this.store.receiptId$;
  receiptName$ = this.store.receiptName$;
  receiptCreatedDate$ = this.store.receiptDateCreated$;
  activeInstance$ = this.store.activeInstance$;
  activeId$ = this.store.activeId$;
  files$ = this.store.files$;
  activeFiles$ = this.store.activeFiles$;

  isLoading: boolean = false;  //блокировка кнопок при загрузке данных в бд или ее отмене
  isEditMode: boolean = false; //режим редактирования

  // Режим работы для активного издания и активного файла
  isWorkStatusOfActiveInstanceIsEdit$ = new BehaviorSubject<boolean>(false);
  isWorkStatucOfActiveFileIsEdit$ = new BehaviorSubject<boolean>(false);

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
    private fileService: FileService
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

     this.activeFiles$.subscribe(res=> console.log(`активный файл`, res));

    this.route.params.pipe(untilDestroyed(this)).subscribe(
      params =>  this.receiptIdFromUrl = params['id']
    );

      this.initReceiptForm();
      this.initInstanceForm();
      this.initFileForm();
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

      // Следим за изменениями в форме с файлами
      this.fileForm.statusChanges.pipe(untilDestroyed(this)).subscribe((status) => {
        switch(status) {
          case 'VALID':
            this.isFileFormValid$.next(true);
            break;
          case 'INVALID':
            this.isFileFormValid$.next(false);
            break;
        }
      });

      // отслеживаем изменение в списке загруженных файлов
      // this.fileService.fileLoadList$.subscribe(
      //   res =>{
      //     if(res != undefined){
      //       const newFileForReceipt = new FilesForReceiptsView();
      //     // id пока специально не добавляю
      //     newFileForReceipt.fileName = res[res.length - 1].name;
      //     newFileForReceipt.mime = res[res.length - 1].type;
      //     newFileForReceipt.name = res[res.length - 1].name;
      //     this.storeService.addNeFile(newFileForReceipt)
      //     }
          
      //   }
      // )
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

  // Реактивная форма файла
  private initFileForm(): void {
    this.fileForm = this.fb.group(
      {
        Name: [null, [Validators.required]],
        CreatedDate: [null, [Validators.required]]
      }
    )
  }

  // Заполняем таблицу изданий и форму поступления
  private getInfoAboutRecieptAndInstances() : void {
    // получили список изданий (тут переделать надо)
    this.storeService.getAllInfoFromReceipt(this.receiptIdFromUrl).pipe(untilDestroyed(this)).subscribe({
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
      }
    });
  }

  //------------------------------------------Все для изданий---------------------------------------
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
  //-------------------------------------------------------------------------------------------------

  //---------------------------------------Все для поступлений---------------------------------------
  // Режим редактирования поступления
  editModeReceipt() : void {
    this.store.isWorkStatusOfReceiptIsEdit$.next(true);
  }
  //-------------------------------------------------------------------------------------------------
  //---------------------------------------------Файлы-----------------------------------------------
  // При скачивании файла, установим активный id
  download(id:string){
    //this.store.setActiveId(id);
    //this.fileService.download(id).subscribe();
  }

  // Режим редактирования
  editModeFile(id: string) : void{
    this.store.setActiveId(id);

    this.activeFiles$.subscribe(
      result => {
        this.fileActive.name = result?.name;
        this.fileActive.createdDate = result?.createdDate;

        // Заполняем реактивную форму
        this.fileForm.setValue({
          Name: this.fileActive.name,
          CreatedDate: this.convertDateTime(this.fileActive.createdDate ?? new Date())
        });
      }
    );

    // сменим статус, так как перешли в редактирование файла
    this.isWorkStatucOfActiveFileIsEdit$.next(true);
  }

  // Сохранить файл
  saveChangesFile(id: string) {

    this.isWorkStatucOfActiveFileIsEdit$.next(false);

    this.activeFiles$.subscribe(
      res => {
        this.fileActive.id = res?.id ?? '';
        this.fileActive.mime = res?.mime;
        this.fileActive.fileName = res?.fileName;

        this.fileActive.createdDate = new Date(this.fileForm.value.CreatedDate);
        this.fileActive.name = this.fileForm.value.Name;

        this.storeService.saveFile(this.fileActive);
      }
    )

    // Отчистим модель данных
    this.fileActive = new FilesForReceiptsView();
    // отчищаем форму
    // this.fileForm.setValue({
    //   Name: this.fileActive.name,
    //   CreatedDate: this.fileActive.createdDate
    // });
    
    this.store.resetActiveId(); // сбросить активный id
  }

  // Отмена изменений
  stopChangesFile(id: string) {
    this.isWorkStatucOfActiveFileIsEdit$.next(false);

    // выберем активный элемент
    this.store.setActiveId(id);

    // this.activeFiles$.subscribe(
    //   result => { 
    //     this.fileActive.createdDate = result?.createdDate;
    //     this.fileActive.name = result?.name;

    //     // Заполняем реактивную форму
    //     this.fileForm.setValue({
    //       Name: this.fileActive.name,
    //       CreatedDate: this.fileActive.createdDate
    //     })
    //   }
    // )
    // вообще может это лишнее и надо просто отчистить форму и сменить режим работы(?)
    // Отчистим модель данных
    this.fileActive = new FilesForReceiptsView();

    // отчищаем форму
    // this.fileForm.setValue({
    //   Name: this.fileActive.name,
    //   CreatedDate: this.fileActive.createdDate
    // });
    
    this.store.resetActiveId(); // сбросить активный id
  }

  // Удалить файл из эльфа
  deleteFile(id: string){

    this.store.setActiveId(id); // определяем активный элемент
    this.storeService.deleteFile(id);
    this.store.resetActiveId(); // сбрасываем активный элемент
  }
  //-------------------------------------------------------------------------------------------------

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

  // Перевод даты и времени в нужный формат
  private convertDateTime(date: Date) : string {
    let timeZone = (date.getTimezoneOffset()/60)*(-1);
    date.setTime(date.getTime() + (timeZone * 60)  * 60 * 1000);
    return date.toISOString().slice(0,16);
  }
}

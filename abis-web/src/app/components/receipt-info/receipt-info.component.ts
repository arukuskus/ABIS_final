import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { tap } from 'rxjs/operators';
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

  // id поступления, записанное в маршрут
  receiptIdFromUrl: string | undefined

  // для управления таблицей
  pageIndex: number = 1;
  total: number = 2;
  pageSize: number = 5;

  // Список столбцов для фильтров и сортировки изданий
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

  //------------------------------Формы---------------------------------
  // Реактивная форма для поступления
  receiptForm!: FormGroup;
  isFormValid$ = new BehaviorSubject<boolean>(false);

  // Реактиваня форма для издания
  instanceForm!: FormGroup;
  isInstanceFormValid$ = new BehaviorSubject<boolean>(false);

  // Реактивная форма для файла
  fileForm!: FormGroup;
  isFileFormValid$ = new BehaviorSubject<boolean>(false);
  //---------------------------------------------------------------------
  
  // Модели поступления, активного издания и активного файла
  receipt = new ReceiptView();
  instanceActive = new InstanceView();
  fileActive = new FilesForReceiptsView();

  isLoading$ = this.store.isSaveLoading$;  // спиннер загрузки сохранения
  isLoadingDelete$ = this.store.isCancleLoading$; // спинер загрузки отмены изменений

  //--------------------Хранилище----------------------------------------
  activeId$ = this.store.activeId$;
  receipt$ = this.store.receipt$;

  instances$ = this.store.instances$;
  activeInstance$ = this.store.activeInstance$;

  files$ = this.store.files$.pipe(
    tap((files) => {
      console.log(`данные файлов изменились`, files);
      return files
    })
  );
  activeFiles$ = this.store.activeFiles$;
  //----------------------------------------------------------------------

  //Все что связано с режимами работы и формоц
  isLoading: boolean = false;  //блокировка кнопок при загрузке данных в бд или ее отмене
  isEditMode$ = new BehaviorSubject<boolean>(false);
  isWorkStatusOfActiveInstanceIsEdit$ = new BehaviorSubject<boolean>(false);
  isWorkStatucOfActiveFileIsEdit$ = new BehaviorSubject<boolean>(false);

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

    this.instances$.subscribe((res) => {
       console.log(`Данные изменились: `, res);
       this.total = res.length;
    });

    this.activeInstance$.subscribe(res=> console.log(`активное издание`, res));
    this.activeFiles$.subscribe(res=> console.log(`активный файл`, res));

    //this.files$.subscribe(res=> console.log(`данные файлов изменились`, res));

    this.receipt$.subscribe(res=> {
      console.log(`данные поступления изменились`, res)
    });
       

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
      next: res => {
        if(res){
          // Сохраняем информацию о поступлении в модель данных
         this.receipt.id = res.id;
         this.receipt.name = res.name;
         this. receipt.createdDate = res.createdDate;

         // Инициализируем форму поступления
          this.receiptForm.setValue({
            Name: res.name,
            CreatedDate: this.convertDateTime(res.createdDate)
         });
        }
      },
      error: () => { alert("упс, что - то пошло не так"); }
    });
  }

  //------------------------------------------Все для изданий---------------------------------------
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

    // отчистим строку, если пользователь передумал добавлять издание
    if(id == undefined){
      // обновление хранилища
      this.store.deleteInstance(id);
    }else{
      let activeInstance = this.store.getActiveInstance(id);
      if(activeInstance != undefined){
        // Заполняем реактивную форму
        this.instanceForm.setValue({Info: activeInstance.info});
      }
    }

     // отчищаем форму
     this.instanceForm.setValue({Info: ''});

     this.instanceActive = new InstanceView(); //отчищаем модель данных

     this.store.resetActiveId(); // сбросить активный id
  }

  // Удалить издание из эльфа
  deleteInstance(id: string){
    this.storeService.deleteInctance(id);
  }

  // режим редактировния Издания (клик по карандашу)
  editMode(id: string) {
    this.store.setActiveId(id); // определяем активный элемент

    let activeInstance = this.store.getActiveInstance(id);
    if(activeInstance != undefined){
      // Заполняем реактивную форму
      this.instanceForm.setValue({Info: activeInstance.info});
    }

    this.isWorkStatusOfActiveInstanceIsEdit$.next(true);
  }

  // добавление строки в таблицу изданий
  addRowInstance(){
    const newRow = new InstanceView();
    this.storeService.addNewInstance(newRow);

    this.isWorkStatusOfActiveInstanceIsEdit$.next(true);

    //перебросим пользователя к странице тблицы с добавлением элемента
    this.pageIndex = this.total;
  }
  //-------------------------------------------------------------------------------------------------

  //---------------------------------------Все для поступлений---------------------------------------
  // Режим редактирования карточки поступления
  editModeReceipt() : void {
    this.isEditMode$.next(true);
  }
  //-------------------------------------------------------------------------------------------------
  //---------------------------------------------Файлы-----------------------------------------------

  // Режим редактирования
  editModeFile(id: string) : void{
    this.store.setActiveId(id);

    let activeFile = this.store.getActiveFile(id);

    if(activeFile != undefined){
      // Заполняем реактивную форму
      this.fileForm.setValue({
        Name: activeFile.name,
        CreatedDate: this.convertDateTime(activeFile.createdDate)
      });
    }

    // сменим статус, так как перешли в редактирование файла
    this.isWorkStatucOfActiveFileIsEdit$.next(true);
  }

  // Сохранить файл
  saveChangesFile(id: string) {
    this.isWorkStatucOfActiveFileIsEdit$.next(false);

    this.fileActive.id = id;
    this.fileActive.createdDate = new Date(this.fileForm.value.CreatedDate);
    this.fileActive.name = this.fileForm.value.Name;

    this.storeService.saveFile(this.fileActive);
    this.store.resetActiveId(); // сбросить активный id
    
    // Отчистим модель данных
    this.fileActive = new FilesForReceiptsView();
    // отчищаем форму
    this.fileForm.setValue({
      Name: '',
      CreatedDate: ''
    });
  }

  // Отмена изменений
  stopChangesFile(id: string) {

    this.isWorkStatucOfActiveFileIsEdit$.next(false);
    let activeFile = this.store.getActiveFile(id);

    if(activeFile != undefined){
      // Заполняем реактивную форму
      this.fileForm.setValue({
        Name: activeFile.name,
        CreatedDate: this.convertDateTime(activeFile.createdDate)
      });
    }

    this.store.resetActiveId(); // сбросить активный id
    // Отчистим модель данных
    this.fileActive = new FilesForReceiptsView();
    // отчищаем форму
    this.fileForm.setValue({
      Name: '',
      CreatedDate: ''
    });
  }

  // Удалить файл из эльфа
  deleteFile(id: string){
    this.storeService.deleteFile(id);
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
          this.isEditMode$.next(true);
        }
      }
      
    )
  }

  // Отменить изменения
  cancleChanges(){
    this.isWorkStatusOfActiveInstanceIsEdit$.next(false);
    this.isEditMode$.next(false);

    // отчищаем хранилище сущностей
    this.store.deleteEntities();
    // отчищаем свойства
    this.store.setNewProps(new ReceiptView());

    // тут лезем в бд через сервис эльфа, чтобы восстановить данные
    this.getInfoAboutRecieptAndInstances();

    this.ngxSmartModalService.getModal("cancelChanges").close(); // закрываем модальное окно (оно само почему-то не хочет)
  }

  download(id: string){
    this.fileService.download(id).subscribe()
  }
  // Перевод даты и времени в нужный формат
  private convertDateTime(date: Date) : string {
    let timeZone = (date.getTimezoneOffset()/60)*(-1);
    date.setTime(date.getTime() + (timeZone * 60)  * 60 * 1000);
    return date.toISOString().slice(0,16);
  }

  // Тут мы получаем инфу от file-comp
  onChanged(increased: NzUploadFile) {
    if(increased != undefined){

      // сложим полученный файл в elf
      this.fileActive.fileName = increased.name;
      this.fileActive.name = increased.name;
      this.fileActive.size = increased.size;
      this.fileActive.id = increased.uid;
      this.fileActive.createdDate = increased.lastModifiedDate ?? new Date();
      // блин, забыла в модель данных размер записать
      
      this.storeService.addNeFile(this.fileActive);
    }else{
      alert("не получилось добавить файл");
    }

    this.fileActive = new FilesForReceiptsView();
  }
}

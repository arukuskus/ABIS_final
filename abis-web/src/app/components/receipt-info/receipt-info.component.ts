import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { RandomService } from 'angular-auth-oidc-client/lib/flows/random/random.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { InstanceView, ReceiptView } from 'src/app/services/ApiService';
import { InstancesStore } from 'src/app/services/instances.store';
import { InstancesStoreService } from 'src/app/services/instances.store.service';

@UntilDestroy()
@Component({
  selector: 'app-receipt-info',
  templateUrl: './receipt-info.component.html',
  styleUrls: ['./receipt-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiptInfoComponent implements OnInit {

  // Реактивная форма для поступления
  receiptForm!: FormGroup;
  isFormValid$ = new BehaviorSubject<boolean>(false);

  // Реактиваня форма для издания
  instanceForm!: FormGroup;
  isInstanceFormValid$ = new BehaviorSubject<boolean>(false);

  // Модели поступления и активного издания
  receipt = new ReceiptView();
  instanceActive = new InstanceView();

  isLoading$ = new BehaviorSubject<boolean>(false);  // спиннер загрузки
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

  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private store: InstancesStore, // хранилище данных
    private storeService: InstancesStoreService // сервис для работы с хранилищем
  ) { }

  ngOnInit(): void {

    // следим зазаполнением активного id и состоянием кнопки
     combineLatest([this.activeId$, this.isWorkStatusOfActiveInstanceIsEdit$]).subscribe(([activeId, isEditWorkStatus]) => {
       if(isEditWorkStatus){
         // ну получили активный элемент и режим редактировния, а как использовать?
         // вызовем метод, который возвращает режим использования
         this.isEditMode = true;
       }else if(!isEditWorkStatus){
         this.isEditMode = false;
       }
     })

    // следим в каком поступлении мы находимся
    this.route.params.pipe(untilDestroyed(this)).subscribe(
      params =>  this.id = params['id']
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
    // получили список изданий
    this.storeService.getInstances(this.id).pipe(untilDestroyed(this)).subscribe({
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

  //##################### Все что связано с изданиями #######################

  // Сохранить издание/Добавить издание
  saveChangesInstance(id: string) {

    this.isWorkStatusOfActiveInstanceIsEdit$.next(false);

    // режим добавления нового элемента
    if(id == undefined){
      //сначала удалим пустой элемент
      this.store.deleteInstance(id);

      // сохраним даные из формы в модель и добавим новое издание
      this.instanceActive.id = this.getRandomInt().toString();
      this.instanceActive.info = this.instanceForm.value.Info;
      this.instanceActive.recieptId = this.id;

      // Добавим издание в хранилище
      this.storeService.addNewInstance(this.instanceActive);

      // Очистим форму
      this.instanceForm.setValue({Info: ''});

      // Отчистим модель данных
      this.instanceActive = new InstanceView();

    }else{
      // режим редактирования существующей записи

      this.instanceActive.id = id;
      this.instanceActive.info = this.instanceForm.value.Info;
      this.instanceActive.recieptId = this.id;

      this.storeService.saveNewInstance(this.instanceActive);

      // Очистим форму
      this.instanceForm.setValue({Info: ''});

      // Отчистим модель данных
      this.instanceActive = new InstanceView();
    }
  }

  // Отмена изменений для изданий
  stopChengesInstance(id: string) {
    this.isWorkStatusOfActiveInstanceIsEdit$.next(false);

    // отчистим строку, если пользователь передумал добавлять издание
    if(id == undefined){
      // обновление хранилища
      this.store.deleteInstance(id);
      // отчищаем форму
      this.instanceForm.setValue({Info: ''});
    }else{
      // выберем активный элемент
      this.store.setActiveId(id);

      this.activeInstance$.subscribe(
        result => { 
          this.instanceActive.id = result?.id ?? '';
          this.instanceActive.info = result?.info;

          // Заполняем реактивную форму
          this.instanceForm.setValue({Info: result?.info});
        }
      )

      // отчищаем форму
      this.instanceForm.setValue({Info: ''});

      this.instanceActive = new InstanceView(); //jnxboftv vjltkm

      this.store.resetActiveId(); // сбросить активный id
    }
  }

  // Удалить издание из эльфа
  deleteInstance(id: string){
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
        this.instanceActive.info = result?.info;

        // Заполняем реактивную форму
        this.instanceForm.setValue({Info: result?.info});
      }
    )

    this.isWorkStatusOfReceiptIsEdit$.next(true);
    this.isWorkStatusOfActiveInstanceIsEdit$.next(true);

    //return combineLatest([this.activeId$, this.isWorkStatusOfActiveInstanceIsEdit$]).subscribe();
  }

  // Режим редактирования поступления
  editModeReceipt() : void {
    this.isWorkStatusOfReceiptIsEdit$.next(true);
  }

  // Что - то мне кажется это странным
  addRowInstance(){
    const newRow = new InstanceView();
    this.storeService.addNewInstance(newRow);

    //  this.instances$.subscribe(
    //    data => {

    //      const newRow = new InstanceView();
    //      data = [newRow].concat(data);
    //    }
    //  )
    this.isWorkStatusOfActiveInstanceIsEdit$.next(true);
  }

  // Сохранить изменения
  saveChanges(){
    // тут лезем в бд через сервис эльфа, чтобы обновить данные
    this.isWorkStatusOfReceiptIsEdit$ .next(false);
  }

  // Отменить изменения
  cancleChanges(){
    this.isWorkStatusOfReceiptIsEdit$.next(false);
    // отчищаем хранилище
    this.store.deleteEntities();
    // отчищаем свойства
    this.store.setNewProps('', '', new Date());
    // тут лезем в бд через сервис эльфа, чтобы восстановить данные
    this.getInfoAboutRecieptAndInstances();
  }

  // Перевод даты и времени в нужный формат
  private convertDateTime(date: Date) : string {
    let timeZone = (date.getTimezoneOffset()/60)*(-1);
    date.setTime(date.getTime() + (timeZone * 60)  * 60 * 1000);
    return date.toISOString().slice(0,16);
  }

  // Рандомный id для издания
  private getRandomInt( ) {
    return Math.floor(Math.random() * 10);
  }

}

import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { ApiClient, ReceiptWithInstancesView, InstanceView, ReceiptView } from 'src/app/services/ApiService';
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

  //Таблица с данными изданий
  tableOfInstances$ = new BehaviorSubject<InstanceView[]>([]);

  // тестим комбаайнЛатест
  //combineLatest(this.activeId$, this.isWorkStatusOfActiveInstanceIsEdit$)

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private store: InstancesStore, // хранилище данных
    private storeService: InstancesStoreService // сервис для работы с хранилищем
  ) { }

  ngOnInit(): void {
    this.instances$.subscribe(
      data => {
        this.tableOfInstances$.next(data);
      }
    )

    // следим в каком поступлении мы находимся
    this.route.params.pipe(untilDestroyed(this)).subscribe(
      params =>  this.id = params['id']
    );

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
        Name: [ this.receipt.name, [Validators.required] ],
        CreatedDate: [ this.receipt.createdDate,  [Validators.required]]
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

  getInstances() : void {
    // получили список изданий
    this.storeService.getInstances(this.id).pipe(untilDestroyed(this)).subscribe({
      next:
        result => {

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
      }
    );
  }

  // Сохранить изменения для поступлений
  saveChangeReceipt(){
    this.isLoading$.next(true);
    
    // сохраним результат из формы в промежуточную переменную
    this.receipt.name = this.receiptForm.value.Name;
    this.receipt.createdDate = new Date(this.receiptForm.value.CreatedDate);

    // отправляемся на сервер эльф с данными поступления
    this.storeService.saveNewReceipt(this.receipt).subscribe({
      next:()=>{},
      error:()=>{},
      complete:()=>{
        this.isLoading$.next(false);
        this.isWorkStatusOfReceiptIsEdit$ .next(false);
      }
    });
  }

  // Отменить изменения
  stopChengesReceipt(){
    this.isWorkStatusOfReceiptIsEdit$.next(false);

    // выдаем значение из свойств хранилища на форму
     this.receiptForm.setValue({
       Name: this.receipt.name,
       CreatedDate: this.convertDateTime(this.receipt.createdDate)
     })
    
  }

  // Сохранить изменения для изданий
  saveChengesInstance(id: string) {

    this.isLoading$.next(true);
    // сохраним результат из формы в промежуточную переменную
    this.instanceActive.info = this.instanceForm.value.Info;

    // если id неизвестно, значит находимся в режиме добавления нового поступления
    if(id == undefined){
      this.instanceActive.recieptId = this.id; //добавляем id поступления из url
      this.storeService.addNewInstance(this.instanceActive).subscribe(
        {
          next: () =>{
            this.instances$.subscribe(data => {this.tableOfInstances$.next(data)});
            // отчищаем форму
            this.instanceForm.setValue({Info: ''});
          },
          error: ()=>{ this.isLoading$.next(false); }, 
          complete: () => {
            this.isLoading$.next(false); 
            this.isWorkStatusOfActiveInstanceIsEdit$.next(false);} 
        }
      );
    }else{
      this.store.setActiveId(id);
      // в режиме изменения существующего издания
      this.storeService.saveNewInstance(this.instanceActive).subscribe(
        {
          next: () =>{ 
            // отчищаем форму
            this.instanceForm.setValue({Info: ''});
          },
          error: ()=>{ this.isLoading$.next(false); }, 
          complete: () => {
            this.isLoading$.next(false); 
            this.isWorkStatusOfActiveInstanceIsEdit$.next(false);
            this.store.resetActiveId(); // сбросить активный id
          } 
        });
    }
  }

  // Отмена изменений для изданий
  stopChengesInstance(id: string) {

    this.isWorkStatusOfActiveInstanceIsEdit$.next(false);

    // отчистим строку, если пользователь передумал добавлять издание
    if(id == undefined){
      this.instances$.subscribe(data => {this.tableOfInstances$.next(data)});
      // отчищаем форму
      this.instanceForm.setValue({Info: ''});
    }else{
      // изменим строку
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

      this.store.resetActiveId(); // сбросить активный id
    }
  }

  deleteInstance(id: string){
    //this.isWorkStatusOfActiveInstanceIsEdit$.next(true);
    // отчистим строку, еслии пустой id
    if(id == undefined){
      this.instances$.subscribe(data => {this.tableOfInstances$.next(data)})
      this.store.resetActiveId(); // сбросить активный id
    }else{
      this.store.setActiveId(id); // определяем активный элемент
      this.isLoadingDelete$.next(true);
      // удалим элемент
      this.storeService.deleteInctance(id).subscribe(
        {
          next: () =>{},
          error: ()=>{}, 
          complete: () => {
            this.isLoadingDelete$.next(false);
            this.store.resetActiveId(); // сбросить активный id
          }
        }
      );
    }
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

    return combineLatest([this.activeId$, this.isWorkStatusOfActiveInstanceIsEdit$]).subscribe();
  }

  // Режим редактирования поступления
  editModeReceipt() : void {
    this.isWorkStatusOfReceiptIsEdit$.next(true);
  }

  // Что - то мне кажется это полным бредом
  addRowInstance(){

    this.instances$.subscribe(
      data => {
        //data = [...data, new InstanceView()];
        const newRow = new InstanceView();
        newRow.info = "";
        const newList = [newRow].concat(data);
        this.tableOfInstances$.next(newList);

        // Заполняем реактивную форму
        this.tableOfInstances$.subscribe(data =>{
          this.instanceForm.setValue({Info: data[0].info})
        })
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

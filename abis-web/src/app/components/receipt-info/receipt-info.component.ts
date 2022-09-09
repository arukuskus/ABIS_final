import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
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

  // Поступлениеи и экземпляры
  receipt = new ReceiptView();
  instances: InstanceView[] = [];

  // Хранилище изданий
  instances$ = this.store.instances$;
  receiptId$ = this.store.receiptId$;
  receiptName$ = this.store.receiptName$;
  receiptCreatedDate$ = this.store.receiptDateCreated$;
  activeInstance$ = this.store.activeInstance$;
  activeId$ = this.store.activeId$;

  //Привязка импутов для издания
  instanceActive = new InstanceView();


  // Режим обращения с изданиями
  workStatus$ = new BehaviorSubject<boolean>(false); // если false - в режиме просмотра, иначе - редактирования
  mainId: string | undefined; // выбранное издание (в итоге должна эта штука из хранилища приходить)

  // Режим обращения с поступлением
  workStatusForReceipt$ = new BehaviorSubject<boolean>(false); 
 
  // id поступления, записанное в маршрут
  id: string | undefined

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private apiClient: ApiClient,
    private store: InstancesStore, // хранилище данных
    private storeService: InstancesStoreService // сервис для работы с хранилищем
  ) { }

  ngOnInit(): void {

    this.instanceActive.id = '';
    this.instanceActive.info = '';

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

  // Вроде следим за изменением формы
  submitReceiptForm(): void {
    if (this.receiptForm.valid) {
      console.log('submit', this.receiptForm.value);
    } else {
      Object.values(this.receiptForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  getInstances() : void {
    // получили список изданий
    this.storeService.getInstances(this.id).pipe(untilDestroyed(this)).subscribe({
      next:
        result => {

          // Сохраняем информацию о поступлении в промежуточную переменную
          this.receipt.id = result.id;
          this.receipt.name = result.name;
          this. receipt.createdDate = result.createdDate;

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
    if(this.workStatusForReceipt$.value == true){
      this.workStatusForReceipt$.next(false);
    }
    
    // сохраним результат из формы в промежуточную переменную
    this.receipt.name = this.receiptForm.value.Name;
    this.receipt.createdDate = new Date(this.receiptForm.value.CreatedDate);

    // отправляемся на сервер эльф с данными поступления
    this.storeService.saveNewReceipt(this.receipt).subscribe();
  }

  // Отменить изменения
  stopChengesReceipt(){
    if(this.workStatusForReceipt$.value == true){
      this.workStatusForReceipt$.next(false);
    }

    // выдаем значение из свойств хранилища на форму
     this.receiptForm.setValue({
       Name: this.receipt.name,
       CreatedDate: this.convertDateTime(this.receipt.createdDate)
     })
    
  }

  // Сохранить изменения для изданий
  saveChengesInstance(id: string) {
    if(this.workStatus$.value == true){
      this.workStatus$.next(false);
    }

    // сохраним результат из формы в промежуточную переменную
    this.instanceActive.info = this.instanceForm.value.Info;

    this.storeService.saveNewInstance(this.instanceActive).subscribe();
  }

  // Отмане изменений для изданий
  stopChengesInstance(id: string) {

    if(this.workStatus$.value == true){
      this.workStatus$.next(false);
    }

    // перезаписали промежуточную переменную
    this.store.setActiveId(id);
    this.activeInstance$.subscribe(
      result => { 
        this.instanceActive.id = result?.id ?? '';
        this.instanceActive.info = result?.info;

        // Заполняем реактивную форму
        this.instanceForm.setValue({Info: result?.info});
      }
    )
  }

  // режим редактировния Издания
  editMode(id: string) : void {
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

    if(this.workStatus$.value == false){
      this.workStatus$.next(true);
    }
  }

  // Режим редактирования поступления
  editModeReceipt() : void {
    if(this.workStatusForReceipt$.value == false){
      this.workStatusForReceipt$.next(true);
    }
  }

  // Перевод даты и времени в нужный формат
  private convertDateTime(date: Date) : string {
    let timeZone = (date.getTimezoneOffset()/60)*(-1);
    date.setTime(date.getTime() + (timeZone * 60)  * 60 * 1000);
    return date.toISOString().slice(0,16);
  }
}

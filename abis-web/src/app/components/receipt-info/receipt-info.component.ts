import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
import { ApiClient, ReceiptWithInstancesView, InstanceView } from 'src/app/services/ApiService';
import { InstancesStore } from 'src/app/services/instances.store';
import { InstancesStoreService } from 'src/app/services/instances.store.service';

@UntilDestroy()
@Component({
  selector: 'app-receipt-info',
  templateUrl: './receipt-info.component.html',
  styleUrls: ['./receipt-info.component.css']
})
export class ReceiptInfoComponent implements OnInit {

  // Реактивная форма для поступления
  receiptForm!: FormGroup;
  isFormValid$ = new BehaviorSubject<boolean>(false);

  // Поступлениеи и экземпляры
  receipt = new ReceiptWithInstancesView();
  instances: InstanceView[] = [];

  // Хранилище изданий
  instances$ = this.store.instances$;
  receiptId$ = this.store.receiptId$;
  receiptName$ = this.store.receiptName$;
  receiptCreatedDate$ = this.store.receiptDateCreated$;

  date = new Date();
  name = '';

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

    // следим в каком поступлении мы находимся
    this.route.params.pipe(untilDestroyed(this)).subscribe(
      params =>  this.id = params['id']
    );

      this.initReceiptForm();
      this.getReceipt(); // опять же нехорошо так делать при инициализации компонента

      // полезная штука, которая следит за изменениями в форме
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

  getReceipt() : void {

    // получили список изданий
    this.storeService.getInstances(this.id).pipe(untilDestroyed(this)).subscribe();
    // this.receiptCreatedDate$.subscribe(
    //   d => {
    //     this.date = d
    //   }
    // )
    // this.receiptName$.subscribe(
    //   d => {
    //     this.name = d;
    //   }
    // )
    // var diff = (this.receipt.createdDate.getTimezoneOffset()/60)*(-1);
    // this.date.setTime(this.date.getTime() + (diff * 60) * 60 * 1000)
    // // инициализируем форму
    // this.receiptForm.setValue({
    //   Name: this.name,
    //   CreatedDate: this.date.toISOString().slice(0,16)
    // })
    

    this.apiClient.receipt(this.id).subscribe(
      {
        next: (data) => {
          this.receipt = data;

          //var t =  this.receipt.createdDate.toISOString().slice(0,-5); // чудесное рабочее чудо!
          var diff = (this.receipt.createdDate.getTimezoneOffset()/60)*(-1);
          this.receipt.createdDate.setTime(this.receipt.createdDate.getTime() + (diff * 60) * 60 * 1000)
          var k = this.receipt.createdDate.toISOString();
          // инициализируем форму
          this.receiptForm.setValue({
            Name: this.receipt.name,
            CreatedDate: this.receipt.createdDate.toISOString().slice(0,16)
          })

           if(this.receipt.instances != undefined){
             this.instances = this.receipt.instances;
           }
        }
      }
    )
  }

  // режим просмотра (поступает id для проверки на каком элементе находимся)
  viewMode() : void {
    //this.mainId = "кракозябра"; // зануляем id
    if(this.workStatus$.value == true){
      this.workStatus$.next(false);
    }
  }

  viewModeReceipt() : void {
    if(this.workStatusForReceipt$.value == true){
      this.workStatusForReceipt$.next(false);
    }
  }

  // режим редактировния
  editMode(id: string| undefined) : void {
    this.mainId = id;
    if(this.workStatus$.value == false){
      this.workStatus$.next(true);
    }
  }

  editModeReceipt() : void {
    if(this.workStatusForReceipt$.value == false){
      this.workStatusForReceipt$.next(true);
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiClient, ReceiptFromIdResult } from 'src/app/services/ApiService';
import { InstanceView, ReceiptView } from 'src/app/services/apiService2';
@Component({
  selector: 'app-receipt-info',
  templateUrl: './receipt-info.component.html',
  styleUrls: ['./receipt-info.component.css']
})
export class ReceiptInfoComponent implements OnInit {


  receiptForm!: FormGroup; // реактивная форма для поступления
  instanceForm!: FormGroup; // реактивная форма для книги
  form:FormGroup[] = [];

  // Поступление + список книг, относящихся к этому поступлению
  receipt = new ReceiptFromIdResult();
  receipts: ReceiptView[] = [];
  instances: InstanceView[] = [];
  receiptInfo = new ReceiptView();

  // Режим обращения с карточкой
  workStatus$ = new BehaviorSubject<boolean>(false); // если false - в режиме просмотра, иначе - редактирования
 
  // id поступления, записанное в маршрут
  id: string | undefined

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private apiClient: ApiClient 
  ) { }

  ngOnInit(): void {

    // следим в каком поступлении мы находимся
    this.route.params.subscribe(
      params =>  this.id = params['id']
    );

     this.getReceipt(); // опять же нехорошо так делать при инициализации компонента
    
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

  // Реактивная форма книги
  private initInctanceForm(): void {
    // this.instanceForm = this.fb.group(
    //   {
    //     //Info: [ null, [Validators.required] ]
    //   });

    this.createInstancesForms(this.form);
  }

  createInstancesForms(form: FormGroup[]){
    this.instances.forEach(instance => {
      form.push(
        this.fb.group({ 
          Info: [ instance.info, [Validators.required] ]
        })
      )
    });

    //let t = this.form.controls[0].value.Info
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

  submitInstanceForm(): void {
    if (this.instanceForm.valid) {
      console.log('submit', this.instanceForm.value);
    } else {
      Object.values(this.instanceForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  getReceipt() : void {
    this.apiClient.receipt(this.id).subscribe(
      {
        next: (data) => {
          this.receipt = data;
          this.initReceiptForm();

          if(this.receipt.instances != undefined){
            this.instances = this.receipt.instances;
            this.initInctanceForm();
          }

          this.receiptInfo.id = this.receipt.id;
          this.receiptInfo.name = this.receipt.name;
          this.receiptInfo.createdDate = this.receipt.createdDate;

          this.receipts.push(this.receiptInfo);

          // Кладем значения в реактивную форму
          this.receiptForm.value.Name = this.receipt.name;
          this.receiptForm.value.CreatedDate = this.receipt.createdDate;

        }
      }
    )
  }

  // режим просмотра
  viewMode() : void {
    if(this.workStatus$.value == true){
      this.workStatus$.next(false);
    }
  }

  // режим редактировния
  editMode() : void {
    if(this.workStatus$.value == false){
      this.workStatus$.next(true);
    }
  }
}

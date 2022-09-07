import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiClient, ReceiptWithInstancesView, InstanceView } from 'src/app/services/ApiService';
import { ReceiptsRepository } from 'src/app/services/receipts.repository';
import { ReceiptsService } from 'src/app/services/reseipts.service';
@Component({
  selector: 'app-receipt-info',
  templateUrl: './receipt-info.component.html',
  styleUrls: ['./receipt-info.component.css']
})
export class ReceiptInfoComponent implements OnInit {


  receiptForm!: FormGroup; // реактивная форма для поступления (тоже не используется)
  instanceForm!: FormGroup; // реактивная форма для книги (тоже не надо)
  form:FormGroup[] = []; // уже похоже не нвдо 

  // Поступление + список книг, относящихся к этому поступлению
  receipt = new ReceiptWithInstancesView();
  instances: InstanceView[] = [];

  //узнаем с каким объектом мы работаем
  receiptId$ = this.repo.activeId$;
  receipt$ = this.repo.activeReceipt$;
  receipts$ = this.repo.receipts$;

  // Режим обращения с книгами
  workStatus$ = new BehaviorSubject<boolean>(false); // если false - в режиме просмотра, иначе - редактирования
  mainId: string | undefined; // чтобы отслеживать где мы находимся

  // Режим обращения с поступлением
  workStatusForReceipt$ = new BehaviorSubject<boolean>(false); 
 
  // id поступления, записанное в маршрут
  id: string | undefined

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private apiClient: ApiClient,
    private repo: ReceiptsRepository, // хранилище данных
    private repoService: ReceiptsService // сервис для работы с хранилищем
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

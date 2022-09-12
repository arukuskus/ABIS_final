import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InstanceServiceService } from 'src/app/services/instance-service/instance-service.service';
import { ApiClient, InstanceView } from 'src/app/services/ApiService';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-instance',
  templateUrl: './instance.component.html',
  styleUrls: ['./instance.component.css']
})

// Компонент для работы с экземплярами книг
export class InstanceComponent implements OnInit {

  
  useForm!: FormGroup;
  instance = new InstanceView;
  isFormValid$ = new BehaviorSubject<boolean>(false);
  isLoading$ = new BehaviorSubject<boolean>(false);  // спиннер загрузки (наблюдаемое)
  //instances: InstanceView[] = [];

  constructor(
    private instanceService: InstanceServiceService,
    private fb: FormBuilder,
    private apiClient: ApiClient
  ) { }

  ngOnInit(): void {

    this.initForm(); // инициализируем форму

    // полезная штука, которая следит за изменениями в форме
    this.useForm.statusChanges.subscribe((status) => {
      switch(status) {
        case 'VALID':
          this.isFormValid$.next(true);
          break;
        case 'INVALID':
          this.isFormValid$.next(false);
          break;
      }
    });

    //this.getInstances();
  }
  
  // Реактивная форма
  private initForm(): void {
    this.useForm = this.fb.group(
      {
        receiptName: [ null, [Validators.required] ],
        info: [ null,  [Validators.required]]
      }
    );
  }

  submitForm(): void {
    if (this.useForm.valid) {
      console.log('submit', this.useForm.value);
    } else {
      Object.values(this.useForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  addInstance() : void {  
     if(this.useForm != null) {

      this.isLoading$.next(true);

      // Заполняем книгу
       this.instance.receiptName = this.useForm.value.receiptName;
       this.instance.info = this.useForm.value.info;

       // Теперь вызовем метод апи
       this.apiClient.instance(this.instance).subscribe({
        next: (res) => {
          if(res){
            alert("книга успешно добавлена")
          }else{
            alert("не удалось добавить книгу")
          }
        },
        error: (err) => {
          
        },
        complete: () => {
          this.isLoading$.next(false);
        }
       });
     }
  }
}

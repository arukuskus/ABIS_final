import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InstanceServiceService } from 'src/app/services/instance-service/instance-service.service';
import { ApiClient, InstanceView } from 'src/app/services/ApiService';
//import { text } from 'express';

@Component({
  selector: 'app-instance',
  templateUrl: './instance.component.html',
  styleUrls: ['./instance.component.css']
})

// Компонент для работы с экземплярами книг
export class InstanceComponent implements OnInit {

  useForm!: FormGroup;
  instance = new InstanceView; // и наж этим я тупила 30 минут )))
  constructor(
    private instanceService: InstanceServiceService,
    private fb: FormBuilder,
    private apiClient: ApiClient
  ) { }

  ngOnInit(): void {
    this.initForm(); // следим за изменением всегда
  }
  
  // Реактивная форма
  private initForm(): void {
    this.useForm = this.fb.group(
      {
        receiptName: [ null, [Validators.required] ],
        info: [ null,  [Validators.required]]
      }
    )
  }

  addInstance() : void {
     if(this.useForm != null) {

       this.instance.receiptName = this.useForm.value.receiptName;
       this.instance.info = this.useForm.value.info;

       // Теперь вызовем метод апи
       this.apiClient.add_instance(this.instance).subscribe(); // Вроде подписаться стоит, иначе ничего не произойдет
     }
  }
}

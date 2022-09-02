import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiClient, InstanceView } from '../ApiService'; // сервис для работы с апи c#

@Injectable({
  providedIn: 'root'
})

// Сервис для работы с экземплярами
export class InstanceServiceService {

  // Модель экземпляра
  instanceView = new BehaviorSubject<InstanceView | undefined>(undefined);

  constructor(
    private apiClient: ApiClient,
  ) { }

  // Добавить новый экземпляр книги
  public AddInstance() : void {
    // const d = this.apiClient.instances();
    // return d;
  }
}

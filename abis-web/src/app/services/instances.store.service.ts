import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiClient, InstanceView, ReceiptView } from './ApiService';
import { InstancesStore } from './instances.store';

@Injectable({
  providedIn: 'root',
})


export class InstancesStoreService {
  

  constructor(
    private readonly store: InstancesStore,
    private readonly _apiService: ApiClient
  ) {}

  //удалить издание
  deleteInctance(id:string){
    this.store.deleteInstance(id);
  }

  // Добавить новое издание
  addNewInstance(newInstance: InstanceView){
    this.store.addInstance(newInstance);
  }

   // Сохранить инфо об одном измененном издании
   saveNewInstance(newInstance: InstanceView){
    this.store.setInstance(newInstance, newInstance.id);
  }

  // Сохраним инфо об измененном поступлении
  saveNewReceipt(newReceipt: ReceiptView){
    this.store.setNewProps(newReceipt.id, newReceipt.name, newReceipt.createdDate);
  }

  // Получить издания и поступление с бэка
  getInstances(id: string | undefined) {
    return this._apiService.receiptGET(id).pipe(
        tap((data) => {
            // тут же сохраним данные в эльф
            this.store.setInstances(data.instances);
            this.store.setNewProps(data.id, data.name, data.createdDate);
        })
    )
  }

  // Сохранить изменения в карточке поступлений


  // Добавить поступление на бэк

}

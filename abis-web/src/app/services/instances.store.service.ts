import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
    return this._apiService.instance3(id).pipe(
      tap((data)=>{
        // true - удалось удалить, false - не удалось
        if(data){
          this.store.deleteInstance(id);
        }
      })
    )
  }

  // Добавить новое издание
  addNewInstance(newInstance: InstanceView){
    return this._apiService.instance(newInstance).pipe(
      tap((data) => {
        // true - удалось добавить, false - не удалось
        if(data){
          this.store.addInstance(data);
          //назначим активный id
          //this.store.setActiveId(id); // определяем активный элемент
        }
      })
    )
  }

  // Сохраним инфо об измененном поступлении
  saveNewReceipt(newReceipt: ReceiptView){
    return this._apiService.receiptPOST(newReceipt).pipe(
      tap((data) => {
        //если из бд пришли какие - то изменения
        if(data){
          this.store.setNewProps(data.id, data.name, data.createdDate);
        }
      })
    )
  }

  // Сохранить инфо об одном измененном издании
  saveNewInstance(newInstance: InstanceView){
    return this._apiService.instance2(newInstance).pipe(
      tap((data) => {
        // если в бд изменения прошли успешно
        if(data){
          //this.store.setActiveId(newInstance.id);
          this.store.setInstance(data, data.id);
        }
      })
    )
  }

  // Сохранить издания
  getInstances(id: string | undefined) {
    return this._apiService.receiptGET(id).pipe(
        tap((data) => {
            // тут же сохраним данные в эльф
            this.store.setInstances(data.instances);
            this.store.setNewProps(data.id, data.name, data.createdDate);
        })
    )
  }
}

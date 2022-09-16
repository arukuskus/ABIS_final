import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ApiClient, InstanceView, ReceiptView, ReceiptWithInstancesView } from './ApiService';
import { InstancesStore } from './instances.store';

@Injectable({
  providedIn: 'root',
})

export class InstancesStoreService {
  
  constructor(
    private readonly _store: InstancesStore,
    private readonly _apiService: ApiClient
  ) {}

  //удалить издание
  deleteInctance(id:string){
    this._store.deleteInstance(id);
  }

  // Добавить новое издание
  addNewInstance(newInstance: InstanceView){
    this._store.addInstance(newInstance);
  }

   // Сохранить инфо об одном измененном издании
   saveNewInstance(newInstance: InstanceView){
    this._store.setInstance(newInstance, newInstance.id);
  }

  // Сохраним инфо об измененном поступлении
  saveNewReceipt(newReceipt: ReceiptView){
    this._store.setNewProps(newReceipt.id, newReceipt.name, newReceipt.createdDate);
  }

  // Получить издания и поступление с бэка
  getInstances(id: string | undefined) {
    return this._apiService.receiptGET(id).pipe(
        tap((data) => {
            // тут же сохраним данные в эльф
            this._store.setInstances(data.instances);
            this._store.setNewProps(data.id, data.name, data.createdDate);
        })
    );
  }

  // Сохранить изменения в карточке поступлений
  saveChangeOfReceipt(){

    const newReceipt = new ReceiptWithInstancesView();
    // вообще, слишком много subscribe и надо с этим что - то делать для сохранения логики
    this._store.receiptId$.subscribe(data=>{newReceipt.id = data??''});
    this._store.receiptDateCreated$.subscribe(data=>{newReceipt.createdDate = data});
    this._store.receiptName$.subscribe(data=>{newReceipt.name = data});

    this._store.instances$.subscribe(data=>{newReceipt.instances = data})

    // ожидаем true или false
    return this._apiService.receiptPOST(newReceipt).pipe();
  }

  // Добавить поступление на бэк
  addNewReceipt(){
    const newReceipt = new ReceiptWithInstancesView();
    this._store.receiptId$.subscribe(data=>{newReceipt.id = data??''});
    this._store.receiptDateCreated$.subscribe(data=>{newReceipt.createdDate = data});
    this._store.receiptName$.subscribe(data=>{newReceipt.name = data});

    this._store.instances$.subscribe(data=>{newReceipt.instances = data});

    return this._apiService.receiptPOST2(newReceipt).pipe();
  }

}

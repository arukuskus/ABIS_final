import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ApiClient, FilesForReceiptsView, InstanceView, ReceiptView, ReceiptWithFullInfo } from './ApiService';
import { InstancesStore } from './instances.store';

@Injectable({
  providedIn: 'root',
})

export class InstancesStoreService {
  
  constructor(
    private readonly _store: InstancesStore,
    private readonly _apiService: ApiClient
  ) {}

  //----------------------------------------Все для изданий---------------------------------------
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
  //-------------------------------------------------------------------------------------------------
  //-----------------------------------------Все для файлов------------------------------------------
  deleteFile(id:string){
    this._store.deleteFile(id);
  }

  addNeFile(newFile: FilesForReceiptsView){
    this._store.addFile(newFile);
  }

  saveFile(file: FilesForReceiptsView){
    this._store.setFile(file, file.id);
  }
  //-------------------------------------------------------------------------------------------------

  // Сохраним инфо об измененном поступлении
  saveNewReceipt(newReceipt: ReceiptView){
    this._store.setNewProps(newReceipt);
  }

  // Получить издания и поступление с бэка
  getAllInfoFromReceipt(id: string | undefined) {
    return this._apiService.receiptGET(id).pipe(
        tap((data) => {
          let receipt = new ReceiptView();
          receipt.id = data.id;
          receipt.createdDate = data.createdDate;
          receipt.name = data.name;

          // тут же сохраним данные в эльф
          this._store.setInstances(data.instances);
          this._store.setNewProps(receipt);
          this._store.setFiles(data.files);
        })
    );
  }

  // Сохранить изменения в карточке поступлений
  saveChangeOfReceipt(){

    const newReceipt = new ReceiptWithFullInfo();

    this._store.receipt$.subscribe(data=>{
      newReceipt.id = data?.receiptId ?? '';
      newReceipt.name = data?.name ?? '';
      newReceipt.createdDate = data?.createdDate ?? new Date();
    });

    this._store.instances$.subscribe(data=>{
      let instances: InstanceView[] = [];
      data.forEach(el =>{
        let instance = new InstanceView();
        instance.id = el.id;
        instance.info = el.info;
        instance.recieptId = el.recieptId

        instances.push(instance);
      })
      newReceipt.instances = instances;
    });

    this._store.files$.subscribe(data => {
      let files: FilesForReceiptsView[] = [];
      data.forEach(el => {
        let file = new FilesForReceiptsView();
        
        file.id = el.id;
        file.name = el.name;
        file.createdDate = el.createdDate;
        file.fileName = el.fileName;
        file.size = file.size;

        files.push(file);
      })
      newReceipt.files = files;
    });

    // ожидаем true или false
    return this._apiService.receiptPOST(newReceipt);
  }

  // Добавить поступление на бэк
  addNewReceipt(){
    const newReceipt = new ReceiptWithFullInfo();

    this._store.receipt$.subscribe(data=>{
      newReceipt.id = data?.receiptId ?? '';
      newReceipt.name = data?.name ?? '';
      newReceipt.createdDate = data?.createdDate ?? new Date();
    });

    this._store.instances$.subscribe(data=>{
      let instances: InstanceView[] = [];
      data.forEach(el =>{
        let instance = new InstanceView();
        instance.id = el.id;
        instance.info = el.info;
        instance.recieptId = el.recieptId

        instances.push(instance);
      })
      newReceipt.instances = instances;
    });

    this._store.files$.subscribe(data => {
      let files: FilesForReceiptsView[] = [];
      data.forEach(el => {
        let file = new FilesForReceiptsView();
        // id пока добавлять нк буду
        file.name = el.name;
        file.createdDate = el.createdDate;
        file.fileName = el.fileName;
        file.size = file.size;

        files.push(file);
      })
      newReceipt.files = files;
    });

    return this._apiService.receiptPOST2(newReceipt);
  }

}

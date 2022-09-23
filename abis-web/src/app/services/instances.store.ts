import { Injectable } from "@angular/core";
import { createState, Store, select, withProps, setProps, StoreDef } from "@ngneat/elf";
import { 
     setEntities, 
     selectAllEntities, 
     withActiveId,
     withEntities, 
     selectActiveEntity,
     selectActiveId,
     setActiveId,
     updateEntities,
     addEntities,
     deleteEntities,
     resetActiveId,
     deleteAllEntities,
     entitiesPropsFactory,
     getEntity
    } from "@ngneat/elf-entities";
import { BehaviorSubject, combineLatest } from "rxjs";
import { map } from "rxjs/operators";

import { FilesForReceiptsView, InstanceView, ReceiptView } from "./ApiService";

// Создаем еще одну сущность для хранения файлов
const { filesEntitiesRef, withFilesEntities } = entitiesPropsFactory('files');

// Свойствами репозитория является поступление
export interface Props {
  receipt: {
    receiptId: string;
    name: string;
    createdDate: Date;
  } | null
}

export interface FileInfo{
  id: string;
  name: string;
  createdDate: Date;
  size: number;
  fileName: string;
}

export interface InstanceInfo{
  id: string;
  info: string;
  recieptId: string | undefined;
}

// Возвращаем состояние и конфигурацию, которые используются при создании хранилища
const { state, config } = createState(
  withProps<Props>({receipt: null}),
  withEntities<InstanceInfo>(),
  withActiveId(),
  withFilesEntities<FileInfo>(),
);

@Injectable()
export class InstancesStore {

  // загрузка данных
  isSaveLoading$ = new BehaviorSubject<boolean>(false);
  isCancleLoading$ = new BehaviorSubject<boolean>(false);

  // Если какая - либо из загрузок работает, блокируем кнопки
  isLoading = combineLatest([this.isSaveLoading$, this.isCancleLoading$]).pipe(
    map(([isSave, isCancel]) => {
      if(isSave || isCancel){
        return true;
      }else{
        return false;
      }
    })
  )

  // информация о поступлении
  receipt$ = this.store.pipe(select((state) => state.receipt));
  
  // хранилище изданий
  instances$ = this.store.pipe(selectAllEntities()); // возвращает observable
  activeInstance$ = this.store.pipe(selectActiveEntity()); // активное издание

  // хранилище файлов
  files$ = this.store.pipe(selectAllEntities({ ref: filesEntitiesRef }));
  activeFiles$ = this.store.pipe(selectActiveEntity({ ref: filesEntitiesRef }));
  
  constructor(readonly store: Store<StoreDef<typeof state>>){}

  // активное id
  activeId$ = this.store.pipe(selectActiveId());
  
  // обновление id
  setActiveId(id: string) {
    this.store.update(setActiveId(id));
  }
  // сбросить активный id
  resetActiveId(){
    this.store.update(resetActiveId());
  }

  // обновление свойств репозитория
  setNewProps(receipt: ReceiptView){
    this.store.update(setProps((state) => ({
      receipt: {
        receiptId: receipt.id,
        name: receipt.name,
        createdDate: receipt.createdDate
      }
    })));
    // this.store.update(setProps((state) => ({
    //   receiptId: id,
    //   name: name,
    //   createdDate: date,
    // })));
  }

  //------------------------------------------------Все для изданий------------------------------
  // удалить издание
  deleteInstance(id: string){
    this.store.update(deleteEntities(id));
  }

  // добавление нового издания
  addInstance(instance: InstanceView){
    let instanceInfo: InstanceInfo = {
      id: instance.id,
      info: instance.info,
      recieptId: instance.recieptId
    }
    this.store.update(addEntities(instanceInfo));
  }

  // обновление издания по id
  setInstance(instance: InstanceView, id: string){
    let instanceInfo: InstanceInfo = {
      id: instance.id,
      info: instance.info,
      recieptId: instance.recieptId
    }
    this.store.update(updateEntities(id, entity => instanceInfo));
  }

  // обновление репозитория
  setInstances(instances: InstanceView[]){
    let instancesInfo: InstanceInfo[] = [];
    instances.forEach(instance => {
      let instanceInfo: InstanceInfo = {
        id: instance.id,
        info: instance.info,
        recieptId: instance.recieptId
      }
      instancesInfo.push(instanceInfo);
    })
    this.store.update(setEntities(instancesInfo));
  }

  // отчистить хранилище от всех сущностей
  deleteEntities(){
    this.store.update(deleteAllEntities());
  }

  // получить активное издание
  getActiveInstance(id: string){
    const todo = this.store.query(getEntity(id));
    return todo;
  }
  //-----------------------------------------------------------------------------------------------
 
  //-------------------------------------------------Все для файлов--------------------------------
   // удалить файл
    deleteFile(id: string){
     this.store.update(deleteEntities(id, { ref: filesEntitiesRef }));
   }
   // обновление файл по id
    setFile(file: FilesForReceiptsView, id: string){
      const todo = this.store.query(getEntity(id, { ref: filesEntitiesRef }));
      if(todo != undefined){
        todo.name = file.name ?? '';
        todo.createdDate = file.createdDate;

        this.store.update(updateEntities(id, entity => todo, { ref: filesEntitiesRef }));
      }
  }

  // Получить активный файл по id
  getActiveFile(id: string) {
    const todo = this.store.query(getEntity(id, { ref: filesEntitiesRef }));
    return todo;
  }

    // добавление нового файла
    addFile(file: FilesForReceiptsView){
      let fileInfo: FileInfo = {
        id: file.id,
        name: file.name ?? '',
        createdDate: file.createdDate,
        size: file.size ?? 0,
        fileName: file.fileName ?? ''
      }
      this.store.update(addEntities(fileInfo, { ref: filesEntitiesRef }));
   }

   // обновление репозитория
   setFiles(files: FilesForReceiptsView[]){
    let filesInfo: FileInfo[] = [];
    files.forEach(file => {
      let fileInfo: FileInfo = {
        id: file.id,
        name: file.name ?? '',
        createdDate: file.createdDate,
        size: file.size ?? 0,
        fileName: file.fileName ?? ''
      }
      filesInfo.push(fileInfo);
    })
    this.store.update(setEntities(filesInfo, { ref: filesEntitiesRef }));
   }

   // отчистить хранилище от файлов
    deleteFileEntities(){
    this.store.update(deleteAllEntities({ ref: filesEntitiesRef }));
  }
  //-----------------------------------------------------------------------------------------------
}

export const InstancesStoreProvider = {
  provide: InstancesStore,
  useFactory(): InstancesStore {
    return new InstancesStore(
      new Store({
        name: 'instances-repository',
        state,
        config,
      })
    );
  }
};
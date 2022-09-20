import { Injectable } from "@angular/core";
import { createState, Store, select, withProps, setProps, StoreDef, createStore } from "@ngneat/elf";
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
     withUIEntities,
     UIEntitiesRef,
     entitiesPropsFactory
    } from "@ngneat/elf-entities";
import { BehaviorSubject, combineLatest } from "rxjs";
import { map } from "rxjs/operators";

import { FilesForReceiptsView, InstanceView } from "./ApiService";

// шо то непонятное
//const { fileEntitiesRef, withFileEntities } = entitiesPropsFactory('files');

export interface Props {
  receiptId?: string;
  name: string;
  createdDate: Date;
}

// Возвращаем состояние и конфигурацию, которые используются при создании хранилища
const { state, config } = createState(
  withProps<Props>({receiptId: '', name: '', createdDate: new Date()}),
  withUIEntities<FilesForReceiptsView>(),
  withEntities<InstanceView>(),
  //withFileEntities<FilesForReceiptsView>(),
  withActiveId(), // храним айдишник сущности
);

// const store = createStore(
//   { name: 'instances-repository' }, 
//   withEntities<InstanceView>(),
//   withFileEntities<FilesForReceiptsView>(),
//   withActiveId(), 
//   );

@Injectable()
export class InstancesStore {

  // загрузка данных
  isSaveLoading$ = new BehaviorSubject<boolean>(false);
  isCancleLoading$ = new BehaviorSubject<boolean>(false);

  // Режим работы для поступления и изданий
  isWorkStatusOfReceiptIsEdit$ = new BehaviorSubject<boolean>(false);
  isWorkStatusOfActiveInstanceIsEdit$ = new BehaviorSubject<boolean>(false);

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

  isEditWorkStatus = combineLatest([this.isWorkStatusOfActiveInstanceIsEdit$, this.isWorkStatusOfReceiptIsEdit$]).pipe(
    map(([isEditInstance, isEditReceipt]) => {
      if(isEditInstance || isEditReceipt){
        return true;
      }else {
        return false;
      }
    })
  )

  // информация о поступлении
  receiptId$ = this.store.pipe(select((state) => state.receiptId));
  receiptName$ = this.store.pipe(select((state) => state.name));
  receiptDateCreated$ = this.store.pipe(select((state) => state.createdDate));

  // хранилище изданий
  instances$ = this.store.pipe(selectAllEntities()); // возвращает observable
  activeInstance$ = this.store.pipe(selectActiveEntity()); // активное издание

  // хранилище файлов
  files$ = this.store.pipe(selectAllEntities({ ref: UIEntitiesRef }));
  activeFiles$ = this.store.pipe(selectActiveEntity({ ref: UIEntitiesRef }));
  
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
  setNewProps(id: string, name: string | undefined, date: Date){
    this.store.update(setProps((state) => ({
      receiptId: id,
      name: name,
      createdDate: date,
    })));
  }

  //------------------------------------------------Все для изданий------------------------------
  // удалить издание
  deleteInstance(id: string){
    this.store.update(deleteEntities(id));
  }

  // добавление нового издания
  addInstance(instance: InstanceView){
    this.store.update(addEntities(instance));
  }

  // обновление издания по id
  setInstance(instance: InstanceView, id: string){
    this.store.update(updateEntities(id, entity => instance));
  }

  // обновление репозитория
  setInstances(instances: InstanceView[]){
    this.store.update(setEntities(instances));
  }

  // отчистить хранилище от всех изданий
  deleteEntities(){
    this.store.update(deleteAllEntities());
  }
  //-----------------------------------------------------------------------------------------------
 
  //-------------------------------------------------Все для файлов--------------------------------
   // удалить файл
    deleteFile(id: string){
     this.store.update(deleteEntities(id, { ref: UIEntitiesRef }));
   }
   // обновление файл по id
    setFile(file: FilesForReceiptsView, id: string){
    this.store.update(updateEntities(id, entity => file, { ref: UIEntitiesRef }));
  }

    // добавление нового файла
    addFile(file: FilesForReceiptsView){
     this.store.update(addEntities(file, { ref: UIEntitiesRef }));
   }

   // обновление репозитория
   setFiles(files: FilesForReceiptsView[]){
     this.store.update(setEntities(files, { ref: UIEntitiesRef }));
   }

   // отчистить хранилище от файлов
    deleteFileEntities(){
    this.store.update(deleteAllEntities({ ref: UIEntitiesRef }));
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
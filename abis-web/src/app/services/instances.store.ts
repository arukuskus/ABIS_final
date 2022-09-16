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
     deleteAllEntities
    } from "@ngneat/elf-entities";
import { BehaviorSubject, combineLatest } from "rxjs";
import { map } from "rxjs/operators";

import { InstanceView } from "./ApiService";

export interface Props {
  receiptId?: string;
  name: string;
  createdDate: Date;
}

// Возвращаем состояние и конфигурацию, которые используются при создании хранилища
const { state, config } = createState(
  withProps<Props>({receiptId: '', name: '', createdDate: new Date()}),
  withEntities<InstanceView>(), // сущность, которая будет храниться в эльфе
  withActiveId(), // храним айдишник сущности
);

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
  activeId$ = this.store.pipe(selectActiveId()); // активное id

  constructor(readonly store: Store<StoreDef<typeof state>>){}

  // отчистить храилище от всех сущностей
  deleteEntities(){
    this.store.update(deleteAllEntities());
  }

  // сбросить активный id
  resetActiveId(){
    this.store.update(resetActiveId());
  }

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

  // обновление id
  setActiveId(id: string) {
    this.store.update(setActiveId(id));
  }

  // обновление репозитория
  setInstances(instances: InstanceView[]){
    this.store.update(setEntities(instances));
  }

  // обновление свойств репозитория
  setNewProps(id: string, name: string | undefined, date: Date){
    this.store.update(setProps((state) => ({
      receiptId: id,
      name: name,
      createdDate: date
    })));
  }
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
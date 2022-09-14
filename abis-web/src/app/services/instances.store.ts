import { Injectable } from "@angular/core";
import { createState, Store, propsArrayFactory, select, withProps, setProps, StoreDef } from "@ngneat/elf";
import { 
    setEntities, 
    selectAllEntities, 
    withActiveId,
     withEntities, 
     selectActiveEntity,
     selectActiveId,
     setActiveId,
     updateEntities,
     selectEntity,
     addEntities,
     deleteEntities,
     resetActiveId,
     deleteAllEntities
    } from "@ngneat/elf-entities";
import { selectRequestStatus } from "@ngneat/elf-requests";
import { BehaviorSubject, combineLatest } from "rxjs";
import { map } from "rxjs/operators";

import { InstanceView, ReceiptWithInstancesView } from "./ApiService";

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


//const store = new Store({ name: 'instances', state, config }); // так называемый репозиторий

@Injectable()
export class InstancesStore {

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

  receiptId$ = this.store.pipe(select((state) => state.receiptId));
  receiptName$ = this.store.pipe(select((state) => state.name));
  receiptDateCreated$ = this.store.pipe(select((state) => state.createdDate));

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
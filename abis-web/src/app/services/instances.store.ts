import { Injectable } from "@angular/core";
import { createState, Store, propsArrayFactory, select, withProps, setProps } from "@ngneat/elf";
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

import { InstanceView, ReceiptWithInstancesView } from "./ApiService";

// сущность - издания InstanceView
// добавтьб withProps - Receipt

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


const store = new Store({ name: 'instances', state, config }); // так называемый репозиторий

@Injectable({
  providedIn: 'root'
})
export class InstancesStore {

  isSaveLoading$ = new BehaviorSubject<boolean>(false);
  isCancleLoading$ = new BehaviorSubject<boolean>(false);

  // Если какая - либо из загрузок работает, блокируем кнопки
  isLoading = combineLatest([this.isSaveLoading$, this.isCancleLoading$]).subscribe(
    (([isSaveLoading, isCancleLoading]) => {
      if(isSaveLoading || isCancleLoading){
         true;
      }else{
        false;
      }
    })
  )

  receiptId$ = store.pipe(select((state) => state.receiptId));
  receiptName$ = store.pipe(select((state) => state.name));
  receiptDateCreated$ = store.pipe(select((state) => state.createdDate));

  instances$ = store.pipe(selectAllEntities()); // возвращает observable
  activeInstance$ = store.pipe(selectActiveEntity()); // активное издание
  activeId$ = store.pipe(selectActiveId()); // активное id

  // отчистить храилище от всех сущностей
  deleteEntities(){
    store.update(deleteAllEntities());
  }

  // сбросить активный id
  resetActiveId(){
    store.update(resetActiveId());
  }

  // удалить издание
  deleteInstance(id: string){
    store.update(deleteEntities(id));
  }

  // добавление нового издания
  addInstance(instance: InstanceView){
    store.update(addEntities(instance));
  }

  // обновление издания по id
  setInstance(instance: InstanceView, id: string){
    store.update(updateEntities(id, instance));
  }

  // обновление id
  setActiveId(id: string) {
    store.update(setActiveId(id));
  }

  // обновление репозитория
  setInstances(instances: InstanceView[]){
    store.update(setEntities(instances));
  }

  // обновление свойств репозитория
  setNewProps(id: string, name: string | undefined, date: Date){
    store.update(setProps((state) => ({
      receiptId: id,
      name: name,
      createdDate: date
    })));
  }
}
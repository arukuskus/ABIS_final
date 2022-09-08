import { Injectable } from "@angular/core";
import { createState, Store, propsArrayFactory, select, withProps, setProps } from "@ngneat/elf";
import { 
    setEntities, 
    selectAllEntities, 
    withActiveId,
     withEntities, 
     selectEntities,
     selectActiveEntities,
     selectActiveEntity,
     getActiveEntity,
     getActiveId,
     selectActiveId
    } from "@ngneat/elf-entities";
import { selectRequestStatus } from "@ngneat/elf-requests";

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

  receiptId$ = store.pipe(select((state) => state.receiptId));
  receiptName$ = store.pipe(select((state) => state.name));
  receiptDateCreated$ = store.pipe(select((state) => state.createdDate));

  instances$ = store.pipe(selectAllEntities()); // возвращает observable
  activeInstance$ = store.pipe(selectActiveEntity()); // активное поступление
  activeId$ = store.pipe(selectActiveId()); // активное id


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
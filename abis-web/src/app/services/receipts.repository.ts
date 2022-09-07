import { Injectable } from "@angular/core";
import { createState, Store, propsArrayFactory, StoreDef } from "@ngneat/elf";
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

import { Subject } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";
import { InstanceView, ReceiptWithInstancesView } from "./ApiService";


export interface Receipt {
  id: string;
  name?: string | undefined;
  createdDate?: Date;
  instances?: InstanceView[] | undefined;
}

// Возвращаем состояние и конфигурацию, которые используются при создании хранилища
const { state, config } = createState(
  // Храним поступление (а внутри него список книг)
  withEntities<Receipt>(), // сущность, которая будет храниться в эльфе
  withActiveId(), // храним айдишник сущности
);

const store = new Store({ name: 'receipts', state, config }); // так называемый репозиторий

@Injectable({
  providedIn: 'root'
})
export class ReceiptsRepository {
  // loading$ = this.store.pipe(
  //   selectIsRequestPending(propertiesRequestStatusKey)
  // );

  receipts$ = store.pipe(selectAllEntities()); // возвращает observable
  activeReceipt$ = store.pipe(selectActiveEntity()); // активное поступление
  activeId$ = store.pipe(selectActiveId()); // активное id


  // обновление репозитория
  setReceipts(receipts: Receipt[]){
    store.update(setEntities(receipts));
  }
}
import { Injectable } from "@angular/core";
import { createState, Store, withProps, StoreDef } from "@ngneat/elf";
import { 
    setEntities, 
    selectAllEntities, 
    withActiveId,
     withEntities 
    } from "@ngneat/elf-entities";
import { 
    createRequestsStatusOperator, 
    selectIsRequestPending, 
    updateRequestStatus, 
    withRequestsStatus 
} from "@ngneat/elf-requests";
import { Subject } from "rxjs";
import { InstanceView, ReceiptFromIdResult, ReceiptView } from "./ApiService";

export const propertiesRequestStatusKey = 'properties-request';

interface PropertiesProps {
  isUpdated: boolean;
}

// Состояние репозитория и настройки
const { state, config } = createState(
  withProps<PropertiesProps>({
    isUpdated: false,
  }),
  withEntities<ReceiptFromIdResult>(), // сущность, которая будет храниться в эльфе (у всех сущностей поле id! обязательное)
  withActiveId(),
  withEntities<ReceiptView>(),
  withActiveId(),
  withEntities<InstanceView>(), 
  withActiveId(), // храним идентификаторы, с которыми работаем прямо сейчас ( не уверенна нужно ли после каждой сущночти вызывать)
  withRequestsStatus<typeof propertiesRequestStatusKey>() // принимает хранилище и возвращает пользовательский оператор.
        // Этот оператор берет ключ запроса и устанавливает его начальный статус в pending. 
        // Обновляется также при ошибке
);

// Репозиторий данных
@Injectable()
export class PropertiesRepository {
  loading$ = this.store.pipe(
    selectIsRequestPending(propertiesRequestStatusKey)
  );
  needReload$ = new Subject<boolean>();

  //properties$ = this.store.pipe(selectAllEntities());

  trackOfferRequestsStatus = createRequestsStatusOperator(this.store);

  constructor(readonly store: Store<StoreDef<typeof state>>) {}

//   setProperties(properties: EstateCardModel[]): void {
//     this.store.update(setEntities(properties));
//   }

  resetRequestStatus(): void {
    this.store.update(
      updateRequestStatus(propertiesRequestStatusKey, 'success')
    );
  }
}

export const PropertiesRepositoryProvider = {
  provide: PropertiesRepository,
  useFactory(): PropertiesRepository {
    return new PropertiesRepository(
      new Store({
        name: 'properties-repository',
        state,
        config,
      })
    );
  },
};

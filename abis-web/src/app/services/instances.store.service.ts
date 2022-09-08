import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiClient } from './ApiService';
import { InstancesStore } from './instances.store';

@Injectable({
  providedIn: 'root',
})


export class InstancesStoreService {
  constructor(
    private readonly store: InstancesStore,
    private readonly _apiService: ApiClient
  ) {}

  // сохраним данные об изданиях в эльф
  getInstances(id: string | undefined) {
    return this._apiService.receipt(id).pipe(
        tap((data) => {
            // тут же сохраним данные в эльф
            this.store.setInstances(data.instances);
            this.store.setNewProps(data.id, data.name, data.createdDate);
        })
    )
  }
}

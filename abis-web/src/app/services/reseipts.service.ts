import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiClient } from './ApiService';
import { ReceiptsRepository } from './receipts.repository';

@Injectable({
  providedIn: 'root',
})
export class ReceiptsService {
  constructor(
    private readonly repo: ReceiptsRepository,
    private readonly _apiService: ApiClient
  ) {}

  // сохраним данные о поступлении в эльф
  getReceipts() {
    return this._apiService.receipts().pipe(
        tap((receipts) => {
            // тут же сохраним данные в эльф
            this.repo.setReceipts(receipts);
        })
    )
  }
}

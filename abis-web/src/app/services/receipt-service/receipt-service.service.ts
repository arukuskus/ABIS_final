import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, ReceiptView } from '../ApiService';

@Injectable({
  providedIn: 'root'
})

// Сервис для работы с поступлениями
export class ReceiptServiceService {

  constructor(
    private apiClient: ApiClient
  ) { }

  // Показать список поступлений
  showReceipts() : Observable<ReceiptView[]> {
    return this.apiClient.receipts();
  }
}

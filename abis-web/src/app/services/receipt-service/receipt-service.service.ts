import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiClient, ReceiptWithInstancesView } from '../ApiService';

@Injectable({
  providedIn: 'root'
})

// Сервис для работы с поступлениями
export class ReceiptServiceService {

  data$ = new BehaviorSubject<any>('none'); // пусть здесь будут данные, которые долы отображаться в таблице

  constructor(
    private apiClient: ApiClient,
  ) { }

  // Показать список поступлений
  showReceipts() : Observable<ReceiptWithInstancesView[]> {
    return this.apiClient.receipts();
  }
}

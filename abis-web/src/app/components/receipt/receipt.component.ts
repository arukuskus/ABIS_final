import { Component, OnInit } from '@angular/core';
import { ReceiptServiceService } from 'src/app/services/receipt-service/receipt-service.service';
import { ReceiptView } from 'src/app/services/ApiService';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.css']
})

// Компонент для рботы с поступлениями
export class ReceiptComponent implements OnInit {

  // Список поступлений
  receipts: ReceiptView[] = [];

  // Модель одного поступления
  //receipt: ReceiptView | undefined; 

  constructor(
    private receiptService: ReceiptServiceService
  ) { }

  ngOnInit(): void {
    // Определяем список поступлений - так делают только если в компоненте нужно следить за изменением данных
    // Выгрузка данных к этому не относится, тут надо подумать как вынести ее отсюда
    this.receiptService.showReceipts().subscribe(
      (data) => {
        this.receipts = data;
      }
    )
  }



}

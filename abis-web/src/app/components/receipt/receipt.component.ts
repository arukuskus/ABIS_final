import { Component, OnInit } from '@angular/core';
import { ReceiptServiceService } from 'src/app/services/receipt-service/receipt-service.service';
import { ReceiptView } from 'src/app/services/ApiService';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.css']
})

// Компонент для рботы с поступлениями
export class ReceiptComponent implements OnInit {

  // Список поступлений
  receipts: ReceiptView[] = [];

  receipt = new ReceiptView();

  id: string | undefined

  // Модель одного поступления
  //receipt: ReceiptView | undefined; 

  constructor(
    private receiptService: ReceiptServiceService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.route.params.subscribe(
      params =>  this.id = params['id']
    );

    this.receiptService.showReceipts().subscribe(
      (data) => {
        this.receipts = data;
      }
    )
  }
}

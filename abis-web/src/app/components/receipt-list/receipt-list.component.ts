import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReceiptView } from 'src/app/services/ApiService';
import { ReceiptServiceService } from 'src/app/services/receipt-service/receipt-service.service';

@Component({
  selector: 'app-receipt-list',
  templateUrl: './receipt-list.component.html',
  styleUrls: ['./receipt-list.component.css']
})
export class ReceiptListComponent implements OnInit {

  // Список поступлений
  receipts: ReceiptView[] = [];
  
  constructor(
    private receiptService: ReceiptServiceService, 
    private router: Router,
  ) { }

  ngOnInit(): void {

    this.receiptService.showReceipts().subscribe(
      (data) => {
        this.receipts = data;
      }
    )
  }

  // Перевоим на страничку поступленй вместе с id
  goTo(id: string | undefined) {
    this.router.navigate(['receipts', id]);
  }

}

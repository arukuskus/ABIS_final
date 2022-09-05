import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReceiptView } from 'src/app/services/ApiService';
import { ReceiptServiceService } from 'src/app/services/receipt-service/receipt-service.service';

@Component({
  selector: 'app-receipt-info',
  templateUrl: './receipt-info.component.html',
  styleUrls: ['./receipt-info.component.css']
})
export class ReceiptInfoComponent implements OnInit {

   // Список поступлений
   receipts: ReceiptView[] = [];

   receipt = new ReceiptView();
 
   id: string | undefined

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

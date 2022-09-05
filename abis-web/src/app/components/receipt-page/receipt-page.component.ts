import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Params, Router } from '@angular/router';
// import { ReceiptView } from 'src/app/services/ApiService';
// import { ReceiptServiceService } from 'src/app/services/receipt-service/receipt-service.service';

@Component({
  selector: 'app-receipt-page',
  templateUrl: './receipt-page.component.html',
  styleUrls: ['./receipt-page.component.css']
})
export class ReceiptPageComponent implements OnInit {

  // Список поступлений
  //receipts: ReceiptView[] = [];

  constructor(
    // private receiptService: ReceiptServiceService, 
    // private router: Router,
  ) { }

  ngOnInit(): void {

    // this.receiptService.showReceipts().subscribe(
    //   (data) => {
    //     this.receipts = data;
    //   }
    // )
  }

  // Перевоим на страничку поступленй вместе с id
  // goTo(id: string | undefined) {
  //   this.router.navigate(['receipts', id]);
  // }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ApiClient, ReceiptWithInstancesView } from 'src/app/services/ApiService';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-receipt-list',
  templateUrl: './receipt-list.component.html',
  styleUrls: ['./receipt-list.component.css']
})
export class ReceiptListComponent implements OnInit {

  // Список поступлений
  receipts: ReceiptWithInstancesView[] = [];

  // будем подписываться на изменение данных в эльфе
  //receipts$ = this.repo.receipts$;
  
  constructor(
    private apiService: ApiClient, 
    private router: Router,
  ) {}

  ngOnInit(): void {

    this.apiService.receipts().pipe(untilDestroyed(this)).subscribe(
      {
        next: data => {
          this.receipts = data;
        }
      }
    )
  }

  // Перевоим на страничку поступленй вместе с id
  goTo(id: string | undefined) {
    this.router.navigate(['receipts', id]);
  }

}



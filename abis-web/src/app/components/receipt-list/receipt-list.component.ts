import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ApiClient, ReceiptWithInstancesView } from 'src/app/services/ApiService';
import { ReceiptsRepository, Receipt } from 'src/app/services/receipts.repository';
import { ReceiptsService } from 'src/app/services/reseipts.service';
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
  receipts$ = this.repo.receipts$;
  
  constructor(
    private apiService: ApiClient, 
    private router: Router,
    private repo: ReceiptsRepository, // хранилище данных
    private repoService: ReceiptsService // сервис для работы с хранилищем
  ) {}

  ngOnInit(): void {

    // это занесение данных в эльф
    this.repoService.getReceipts()
    .pipe(untilDestroyed(this))
    .subscribe(
      {
        next: (data) => {
          this.repo.setReceipts(data);
        }
      }
    )


    // а это в список в компоненте
    // .pipe(
    //   tap((receipts) => {
    //     // тут же сохраним данные в эльф
    //     this.repo.setReceipts(receipts);
    //   })
    // )
    this.apiService.receipts()
    .subscribe(
      {
        next: (data) => {
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



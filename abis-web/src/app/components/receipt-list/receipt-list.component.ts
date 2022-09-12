import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ApiClient, ReceiptView, ReceiptWithInstancesView } from 'src/app/services/ApiService';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-receipt-list',
  templateUrl: './receipt-list.component.html',
  styleUrls: ['./receipt-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiptListComponent implements OnInit {

  // Список поступлений
  receipts$ = new BehaviorSubject<ReceiptView[]>([]);
  
  constructor(
    private apiService: ApiClient, 
    private router: Router,
  ) {}

  ngOnInit(): void {

    this.apiService.receipts().pipe(untilDestroyed(this)).subscribe(
      {
        next: data => {
          this.receipts$.next(data);
        }
      }
    )
  }

  // Перевоим на страничку поступленй вместе с id
  goTo(id: string | undefined) {
    this.router.navigate(['receipts', id]);
  }

}



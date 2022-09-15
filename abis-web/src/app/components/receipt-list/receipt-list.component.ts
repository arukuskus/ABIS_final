import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ApiClient, ReceiptView, ReceiptWithInstancesView } from 'src/app/services/ApiService';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';


// Интерфейс для фильтров
interface ColumnItem {
  name: string; // к какой колонке фильтр применяется
  sortOrder: NzTableSortOrder | null; // для сортировки столбца по умолчанию
  sortFn: NzTableSortFn<ReceiptView> | null; // результат сортировки
  listOfFilter: NzTableFilterList; // это наверное список фильтров
  filterFn: NzTableFilterFn<ReceiptView> | null; // определяет отфильтрованый результата
  filterMultiple: boolean; // указать является ли выбор множественным или одиночным
  sortDirections: NzTableSortOrder[]; // это вроде значки сортировки
}

@UntilDestroy()
@Component({
  selector: 'app-receipt-list',
  templateUrl: './receipt-list.component.html',
  styleUrls: ['./receipt-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiptListComponent implements OnInit {
  searchValue = '';

  // Список столбцов
  listOfColumns: ColumnItem[] = [
    {
      name: 'Name',
      sortOrder: null,
      sortFn: (a: ReceiptView, b: ReceiptView) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: (list: string[], item: ReceiptView) => list.some(name => item.name.indexOf(name) !== -1)
    },
  ];

  // Список поступлений
  receipts$ = new BehaviorSubject<ReceiptView[]>([]);
  receiptData: ReceiptView[] = []; // тоже вспомогательный лист, который хранить первоначальную инфу, пришедшую с сервера

  // для управления таблицей
  pageIndex: number = 1;
  pageSize: number = 5;
  total: number = 0;
  
  constructor(
    private apiService: ApiClient, 
    private router: Router,
  ) {}

  ngOnInit(): void {

    this.receipts$.subscribe(
      res=>{
        this.total = res.length
      }
    )

    this.apiService.receipts().pipe(untilDestroyed(this)).subscribe(
      {
        next: data => {
          this.receipts$.next(data);
          this.receiptData = data;
        }
      }
    )
  }

  // Перевоим на страничку поступленй вместе с id
  goTo(id: string | undefined) {
    this.router.navigate(['receipts', id]);
  }


  // отчистка фильтра поиска
  reset(): void {
    this.searchValue = '';
    this.search();
  }

  // поиск
  search(): void {
    this.receipts$.next(this.receiptData.filter((item: ReceiptView) => item.name.indexOf(this.searchValue) !== -1));
  }

  // отчистка фильтров
  resetFilters(): void {
  }

  // отчистка сортировки и фильтров
  resetSortAndFilters(): void {
    this.listOfColumns.forEach(item => {
      item.sortOrder = null;
    });
  }

}



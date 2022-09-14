import { Component, OnInit } from '@angular/core';
import { InstanceView } from 'src/app/services/ApiService';

@Component({
  selector: 'app-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.css']
})
export class InstancesComponent implements OnInit {

  instances: InstanceView[] = [];
  
  constructor(
  ) { }

  ngOnInit(): void {
  }

}

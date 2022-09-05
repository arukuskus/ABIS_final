import { Component, OnInit } from '@angular/core';
import { ApiClient, InstanceView } from 'src/app/services/ApiService';

@Component({
  selector: 'app-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.css']
})
export class InstancesComponent implements OnInit {

  instances: InstanceView[] = [];
  
  constructor(
    private apiClient2: ApiClient
  ) { }

  ngOnInit(): void {

    this.getInstances();
  }


  getInstances() : void {
    this.apiClient2.instances().subscribe(
      data => {
        this.instances = data
      }
    )
  }

}

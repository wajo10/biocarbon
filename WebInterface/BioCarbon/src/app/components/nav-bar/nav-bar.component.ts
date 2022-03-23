import { Component, OnInit } from '@angular/core';
import {StorageService} from '../../_services/storage.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  constructor(public storage: StorageService, public router: Router) { }

  ngOnInit(): void {
  }
  signOut(){
    this.storage.signOut();
    this.router.navigate(['/', 'Login']);
  }

}

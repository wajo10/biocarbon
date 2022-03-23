import {Component, OnInit} from '@angular/core';
import {HttpService} from '../_services/http.service';
import {Router} from "@angular/router";
import {StorageService} from "../_services/storage.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private httpService: HttpService, private router: Router, private storage: StorageService) {
  }

  ngOnInit(): void {
    if (this.storage.getUser() !== null) {
      this.router.navigate(['/', 'Dashboard'])
    }
  }

  public signIn() {
    const username = (document.getElementById('user') as HTMLInputElement).value;
    const pass = (document.getElementById('password') as HTMLInputElement).value;

    this.httpService.get_api_id("login", `${username}/${pass}`).subscribe((res: any) => {
      var user = res["data"];
      this.storage.setUser(user);
      this.router.navigate(['/', 'Dashboard'])
    }, _ => alert("Credenciales Incorrectas"))
  }

}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  public getUser(): any{
    const data = window.localStorage.getItem('usuario');
    return JSON.parse(data as string);
  }
  public setUser(user: any): void{
    window.localStorage.setItem('usuario', JSON.stringify(user));
  }
  public signOut(): void{
    window.localStorage.clear();
  }

}

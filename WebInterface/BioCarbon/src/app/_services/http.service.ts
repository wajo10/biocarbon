import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  url: string;
  constructor(private http: HttpClient) {
    //this.url = 'http://localhost:3031/api/biocarbon/';
    this.url = 'http://201.207.53.225:3031/api/biocarbon/';
  }

  public get_api(term){
    return this.http.get(this.url + term);
  }

  get_api_id(term, id) {
    return this.http.get(this.url + term + '/' + id);
  }

  post_api(term, json) {
    return this.http.post(this.url + term, json);
  }

  put_api_id(term, id, json) {
    return this.http.put(this.url + term + '/' + id, json);
  }

  put_api(term, json) {
    console.log(json);
    return this.http.put(this.url + term, json);
  }

  delete_api(term, id) {
    return this.http.delete(this.url + term + '/' + id);
  }
}

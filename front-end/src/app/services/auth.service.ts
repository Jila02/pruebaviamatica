import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private URL:string ='http://localhost:3000'

  constructor(private http: HttpClient) { }

  login(user):Observable<HttpResponse<any>> {
    return this.http.post<any>(this.URL + '/login',user)
  }
}

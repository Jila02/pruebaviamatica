import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private URL: string = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  select(): Observable<HttpResponse<any>> {
    return this.http.get<any>(this.URL + '/selectUser');
  }

  insert(user):Observable<HttpResponse<any>> {
    return this.http.post<any>(this.URL + '/insertUser',user)
  }
}

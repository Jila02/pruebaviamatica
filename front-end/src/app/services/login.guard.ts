import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate {
    constructor(private router: Router) { }


    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean | UrlTree> {
        
        const token = window.localStorage.getItem('token');
        
        if (token == null || token == '' || token == undefined || token == 'undefined') {
            return true
        }
        
        return this.router.parseUrl('/users');
    }
}
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router} from '@angular/router';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

 user={
  email:'',
  password:''
 }

  constructor( private router: Router,private authService: AuthService)  {}

  onLogin() {

    this.authService.login(this.user).subscribe({
      next: (response:any) => {

        console.log('response:',response);

        if(response && response.token && response.token!=''){
          localStorage.setItem('token',response.token)
          if (response.admin) {
            this.router.navigate(['/dashboard']); // Navegar a la pantalla exclusiva de admin
          } else {
            this.router.navigate(['/home']); // Navegar a la pantalla para usuarios normales
          }
        }
          
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
      complete: () => {
        console.log('Data fetching completed');
      }
    });
    // console.log(this.user
          // this.router.navigate(['/users']);

  }


}

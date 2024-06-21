import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http'; // Importa HttpResponse si es necesario
import { UsersService } from '../services/users.service'; // Ajusta la ruta según sea necesario

@Component({
  selector: 'app-user',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UserComponent implements OnInit {

  userData: any[] = []; // Asegúrate de inicializar userData como un arreglo vacío

  user = {
    email: '',
    password: '',
    username: ''
  };



  excelDownloadUrl: string = 'http://localhost:3000/excel'; // Ajusta la URL según la configuración de tu servidor


  showmodal = false;

  constructor(private usersService: UsersService) { }

  ngOnInit(): void {
    this.loadUsers(); 
  }

  loadUsers(): void {
    this.usersService.select().subscribe(
      (response: any) => {
   
        this.userData = response;
        console.log('Datos de usuario:', this.userData);
      },
      (error) => {
        console.error('Error al obtener los datos del usuario:', error);
      }
    );
  }

  Register(): void {
    console.log(this.user)
    this.usersService.insert(this.user).subscribe(
      (response: HttpResponse<any>) => {
        this.userData.push(response.body); // Agrega el nuevo usuario al arreglo
        console.log('Nuevo usuario registrado:', response.body);
        this.closeModal(); // Cierra el modal después de registrar
      },
      (error) => {
        console.error('Error al registrar usuario:', error);
      }
    );
  }

  Modal(): void {
    this.showmodal = !this.showmodal;
  }

  closeModal(): void {
    this.showmodal = false;
  }


}

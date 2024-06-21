import { Component, OnInit } from '@angular/core';
import { DashBoardService } from '../services/dashboard.service'; // Asegúrate de importar correctamente el servicio

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'] // Cambiado a styleUrls para cargar el CSS correctamente
})
export class DashboardComponent implements OnInit {
  userData: any[] = []; // Asegúrate de inicializar userData como un arreglo vacío

  constructor(private dashBoardService: DashBoardService) {} // Inyecta el servicio DashboardService en el constructor

  ngOnInit(): void {
    this.loadUsers(); // Llama a la función para cargar usuarios al inicio
  }

  loadUsers(): void {
    this.dashBoardService.select().subscribe(
      (response: any) => {
        // Manejar la respuesta exitosa aquí
        this.userData = response; // Asigna la respuesta al arreglo userData
        console.log('Datos de usuario:', this.userData);
      },
      (error) => {
        // Manejar el error aquí
        console.error('Error al obtener los datos del usuario:', error);
      }
    );
  }
}

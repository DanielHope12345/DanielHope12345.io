import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ControllerService } from '../registro/controller.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor( private controllerService: ControllerService) { }

  ngOnInit(): void {
  }

  Login(formulario: NgForm){

    let usuario = formulario.value.usuarioLogin;
    let password = formulario.value.passwordLogin;

    console.log("Usuario:" +usuario +"\nContrasena:" +password);
    console.log(formulario.form);

    let objeto = {
      usuario: usuario,
      password: password
    }

    this.controllerService.login(objeto).subscribe( 
      res => alert("Acceso concedido"),
      error => alert("Usuario o contraseña invalido")
      
    )

  }

}

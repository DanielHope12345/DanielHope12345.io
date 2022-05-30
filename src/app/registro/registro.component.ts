import { Component, OnInit } from '@angular/core';
import { ControllerService } from "../registro/controller.service";
import { Router } from "@angular/router";
import { FormControl, NgForm, Validators } from '@angular/forms';


interface ObjetoOpcion {
  num: Number,
  text: String
}

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {

  Pyme: number = 0;
  message: string = "";

  //Variables cuestionario PYME
  empleadosPyme: boolean = false;
  ingresosPyme: boolean = false;  
  GiroIngresado: boolean = false;
  formularioEnviado: boolean = false;

  //Opciones combos
  OpcionesNumEmpleados: Array<ObjetoOpcion> = [
    { num: 1, text: "1 a 5" },
    { num: 2, text: "6 a 10" },
    { num: 3, text: "Mas de 10" }
  ]

  OpcionesNegocio: Array<ObjetoOpcion> = [
    { num: 1, text: "Unico" },
    { num: 2, text: "Tiene sucursales" },
  ]

  OpcionesIngresos: Array<ObjetoOpcion> = [
    { num: 1, text: "Menor de 100 mil pesos al mes" },
    { num: 2, text: "Entre 101 y 300 mill pesos al mes" },
    { num: 3, text: "Mas de 300 mil pesos al mes" },

  ]

  //Respuestas del cuestionario de tipo de empresa
  Giro: string = "Test";
  employOption = this.OpcionesNumEmpleados[0];
  negocioOption = this.OpcionesNegocio[0];
  ingresoOption = this.OpcionesIngresos[0];

  GiroCambio(){

    // console.log("Detecte un  cambio en el modelo");

    if (this.Giro.length > 0) {
      this.GiroIngresado = true
    }
  }

  enviarCuestionario() {

    this.formularioEnviado = true;

    if (this.employOption.num == 3) { this.empleadosPyme = false } else { this.empleadosPyme = true; }
    if (this.ingresoOption.num == 3) { this.ingresosPyme = false } else { this.ingresosPyme = true; }

    if (this.Giro.length == 0) {
      this.GiroIngresado = false;
    } else {

      this.GiroIngresado = true;


      //Validacion de reglas de negocio
      if (this.empleadosPyme && this.ingresosPyme) {

        //Mandarlo al modulo de seleccion de red
        this.router.navigate(['registro/network']);

      } else {

        //Mandarlo a la vista de registro de datos de contacto
        this.Pyme = 1;
        // alert("No eres una PYME");

      }

      // console.log("Giro del negocio:" + this.Giro + "\nNumero de empleados: " + this.employOption.text +
      //   "\nNegocio: " + this.negocioOption.text + "\nIngresos: " + this.ingresoOption.text);
    }
  }

  guardarDatosContacto(datosContactoForm: NgForm){
    console.log(datosContactoForm.value);
    console.log("El formulario es valido? "+datosContactoForm.valid );
  }

  validarDatosContacto(){

    let campoCorreo = new FormControl('bad@', Validators.email);



    // console.log("Hubieron errores en el correo? " + JSON.stringify(    campoCorreo.invalid));
    // if (campoCorreo.errors != null) {
    //   alert("Error en el correo ingresado!");
    // }else{
    //   alert("Correo ingresado de manera existosa");
    // }
  }

  constructor(private controllerService: ControllerService, private router: Router) { }

  ngOnInit(): void {
    // this.controllerService.getWelcomeMessage().subscribe(res => {
    //   console.log(res)
    //   let temp = Object.values(res)[0]
    //   this.message = temp
    // })
  }

}

import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import {  Subject } from 'rxjs';
import { ControllerService } from '../registro/controller.service';
import { GoogleMap, MapMarker, MapInfoWindow } from '@angular/google-maps'
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { DateTime } from "luxon";
import { environment } from "./../../environments/environment"


interface Sucursal {
  Id_Sucursal: number,
  Id_Negocio: number,
  Nombre_Sucursal: string,
  position: Position,
  Ciudad: string,
  CP: string,
  Estado: string,
  Colonia: string
  Logo: string,
  // Label: google.maps.MarkerLabel,
  Inventario: string
  Segundos: number | null
  Pantallas: number | null
  DiasDisponibles: number | null
}

interface Player {
  Id_Player: number |null,
  Id_Sucursal: number | null,
  Nombre_Sucursal: string | null,
  Nombre_Player: string |null,
  Fecha: string | null,
  Segundos:number | null,
  Pantallas: number | null,
  Cotizacion: number | null
}

interface negocioItem {
  name: string
  id: number
}

interface Position {
  lat: number,
  lng: number
}

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css']
})

export class NetworkComponent implements AfterViewInit, OnDestroy, OnInit {

  //Variable de ubicacion de assets
  public baseHref = environment.baseHref;

  //Variables de inicializacion del mapa
  markerPositions: Position[] = [];
  markerOptions: google.maps.MarkerOptions = { draggable: false, clickable: true, opacity: 1.0 }
  center = { lat: 23.93007860197274, lng: -102.39166950667412 };
  zoom = 5;
  bounds = new google.maps.LatLngBounds();
  position!: Position;
  MarkerLabel: google.maps.MarkerLabel = {
    text: '',
    color: 'BLACK',
    fontFamily: 'Poppins',
    fontSize: '12px'
  }
  @ViewChildren(MapInfoWindow) infoWindowsView!: QueryList<MapInfoWindow>;

  //Variables de inicializacion de las tablas
  dtTrigger0: Subject<any> = new Subject();
  dtTrigger1: Subject<any> = new Subject();
  dtOptions: any[] = [];
  @ViewChildren(DataTableDirective)
  dtElements!: QueryList<DataTableDirective>;

  //Configuracion multiselect 
  dropDownSettings: IDropdownSettings = {};

  //Banderas para detectar cuando se haya terminado la carga de datos
  consultedNetworks: boolean = false;

  //Arreglos desde los cuales se obtienen los datos para las tablas, mapa y multiselect
  arrayOptions: Array<negocioItem> = [];
  arraySucursales: Array<Sucursal> = [];
  arraySucursalesTotal: Array<Sucursal> = [];
  arrayPlayers: Array<Player> = [];

  contadorDisponibilidadPlayers: number = 0;
  contadorRecorridoRedes = 0;

  //Banderas para detectar que cobertura debe de aplicarse
  CoberturaNacional: boolean = false;
  CoberturaCP: boolean = false;
  CoberturaEstado: boolean = false;
  CoberturaCiudad: boolean = false;

  // Variables de inicio para filtros de cobertura
  selectAllRows: boolean = false;
  selectAllRows1: boolean = false;
  defaultNetwork: Array<negocioItem> = [];
  defaultEstado = "Aguascalientes";
  FiltroCP: number = 0;
  defaultCiudad: string = "";  

  banderaSucursales: boolean = false;

  fechaInicio: string = "";
  fechaFin: string = "";
  fechasVacias: boolean = false;

  interfazPlayers: boolean = false;
  arrayEstados: Array<any> = [
    "Aguascalientes",
    "Baja California",
    "Baja California Sur",
    "Campeche",
    "CDMX",
    "Chiapas",
    "Chihuahua",
    "Coahuila",
    "Colima",
    "Durango",
    "Estado de Mexico",
    "Guanajuato",
    "Guerrero",
    "Hidalgo",
    "Jalisco",
    "Michoacan",
    "Morelos",
    "Nayarit",
    "Nuevo Leon",
    "Oaxaca",
    "Puebla",
    "Queretaro",
    "Quintana Roo",
    "San Luis Potosi",
    "Sinaloa",
    "Sonora",
    "Tabasco",
    "Tamaulipas",
    "Tlaxcala",
    "Veracruz",
    "Yucatan",
    "Zacatecas",
  ];

  Cotizacion: number = 0;
  CotizacionMostrar: number = 0;
  contadorSucursalesCotizacion: number = 0;

  @ViewChild(GoogleMap) googleMap!: GoogleMap;

  //Metodo que se ejecuta al seleccionar o deseleccionar una red
  async NetworkChange() {

    //Se limpian los arreglos y contador para mostrar solo lo que mande el usuario
    this.contadorDisponibilidadPlayers = 0;
    this.arraySucursalesTotal.length = 0;
    this.arraySucursales.length = 0;
    let invent = "";

    let numeroRedes = this.defaultNetwork.length;

    if (numeroRedes != 0) {

      for (let index = 0; index < numeroRedes; index++) {

        const element = this.defaultNetwork[index];
        // console.log("Obteniendo sucursales de " + element.name);

        let idRed = element.id;
        let res = await this.fillSucursalesCombo(idRed);
        let tempArr = res.data;

        for (let index = 0; index < tempArr.length; index++) {

          const element = tempArr[index];

          let MarkerLabelT: google.maps.MarkerLabel = {
            text: element.Nombre_Sucursal,
            color: 'GRAY',
            fontFamily: 'Poppins',
            fontSize: '12px'
          }

          let objetoTemp: Sucursal = {
            Id_Sucursal: element.Id_Sucursal,
            Id_Negocio: element.Id_Negocio,
            Nombre_Sucursal: element.Nombre_Sucursal,
            position: {
              lat: element.Latitud,
              lng: element.Longitud
            },
            Colonia: element.Colonia,
            CP: element.CP,
            Ciudad: element.Ciudad,
            Estado: element.Estado,
            Logo: this.baseHref +'/'+ element.Id_Negocio + '.png',
            // Label: MarkerLabelT,
            Inventario: invent,
            Segundos: null,
            Pantallas: null,
            DiasDisponibles: null
          }
          this.arraySucursalesTotal.push(objetoTemp);
          //  console.log("Ciudad: " + objetoTemp.CP);
        }
      }

      // console.log("Fin del recorrido de sucursales desde red");
      // console.log(this.arraySucursalesTotal.length);

      this.drawMapMarkers();

      this.rerender(true);
    }else{
      this.banderaSucursales = false;
    }

  }

  //Metodo que obtiene las sucursales de una red
  fillSucursalesCombo(idRed: Number): Promise<any> {
    this.banderaSucursales = false;
    let parametroSucursal = { IdNegocio: idRed }
    return this.controllerService.getSucursales(parametroSucursal).toPromise();
  }

  //Manera alternativa de crear nua peticion como promesa
  //   fillSucursalesComboP(idRed: Number): Promise<any>{
  //     let parametroSucursal = { IdNegocio: idRed }
  //     let datosSucursales: Array<any> = [];

  //     const promise = new Promise<void>((resolve, reject) => {
  //       this.controllerService.getSucursales(parametroSucursal).subscribe({
  //         next:(res:any) =>{
  //           datosSucursales = res.data;
  //           resolve();
  //         },
  //         error:(err: any) =>{
  //           reject(err);
  //         },
  //         complete: () => {

  //           datosSucursales.forEach((element: any) => {

  //             let objetoTemp: Sucursal = {
  //               Id_Sucursal: element.Id_Sucursal,
  //               Id_Negocio: element.Id_Negocio,
  //               Nombre_Sucursal: element.Nombre_Sucursal,
  //               position: {
  //                 lat: element.Latitud,
  //                 lng: element.Longitud
  //               },
  //               Colonia: element.Colonia,
  //               CP: element.CP,
  //               Ciudad: element.Ciudad,
  //               Estado: element.Estado
  //             }

  //             this.arraySucursalesTotal.push(objetoTemp);
  //           });

  //           console.log("Promesa sucursales completa");
  //           // console.log(datosSucursales);
  //           this.drawMapMarkers();
  //         }
  //       })

  //     })
  //     return promise;
  // }

  drawMapMarkers() {

    try {
      this.contadorDisponibilidadPlayers = 0;
      this.bounds = new google.maps.LatLngBounds(null);
      let tempCP = this.FiltroCP.toString();

      this.arraySucursalesTotal.forEach(element => {

        let tempLat = element.position.lat;
        let tempLng = element.position.lng;

        if (!isNaN(tempLat) && tempLat != null && tempLat != 0
          && !isNaN(tempLng) && tempLng != null && tempLng != 0) {
          this.position = {
            lat: tempLat,
            lng: tempLng
          }

          if (this.CoberturaNacional) {
            this.arraySucursales.push(element)
            this.bounds.extend(new google.maps.LatLng(this.position.lat, this.position.lng))
          }
          else if (this.CoberturaCP) {
            if (element.CP == tempCP) {
              this.arraySucursales.push(element)
              this.bounds.extend(new google.maps.LatLng(this.position.lat, this.position.lng))
            }
          }
          else if (this.CoberturaEstado) {
            if (element.Estado == this.defaultEstado) {
              this.arraySucursales.push(element)
              this.bounds.extend(new google.maps.LatLng(this.position.lat, this.position.lng))
            }
          }
          else if (this.CoberturaCiudad) {
            if (element.Ciudad == this.defaultCiudad) {
              this.arraySucursales.push(element)
              this.bounds.extend(new google.maps.LatLng(this.position.lat, this.position.lng))
            }
          }
          else if (!this.CoberturaCP && !this.CoberturaNacional && !this.CoberturaEstado && !this.CoberturaCiudad) {
            if (element.Estado == "CDMX") {
              this.arraySucursales.push(element)
              this.bounds.extend(new google.maps.LatLng(this.position.lat, this.position.lng))
            }
          }

        }
      });

      // console.log("Tamaño arreglo filtrado:" + this.arraySucursales.length);

      if (this.arraySucursales.length == 0) {
        this.googleMap.zoom = 10;
        this.googleMap.center = this.center;
        this.banderaSucursales = false;
      } else {
        this.googleMap.fitBounds(this.bounds);
        this.banderaSucursales = true;
      }

    } catch (error) {
      console.log("[drawMapMarkers]Error:" + error);
    }
  }

  CoberturaNacionalChange(Check: any) {

    // console.log("Se cambio la cobertura nacional: " + Check);
    this.arraySucursales.length = 0;

    if (Check) {
      this.CoberturaNacional = true;
      this.CoberturaEstado = false;
      this.CoberturaCiudad = false;
      this.CoberturaCP = false;
      this.drawMapMarkers();
    } else {
      this.CoberturaNacional = false;
      this.drawMapMarkers();
    }

    this.arrayPlayers.length = 0;
    this.rerender(false);
  }

  CoberturaCPChange(Check: boolean) {
    // console.log("Se cambio la cobertura codigo postal: " + Check);
    if (Check) {
      this.CoberturaCiudad = false;
      this.CoberturaCP = true;
      this.CoberturaNacional = false;
      this.CoberturaEstado = false;
    } else {
      this.CoberturaCP = false;
    }

    this.arrayPlayers.length = 0;
  }

  CoberturaEstadoChange(Check: boolean) {
    // console.log("Se cambio la cobertura de estado: " + Check);
    if (Check) {
      this.CoberturaCiudad = false;
      this.CoberturaEstado = true;
      this.CoberturaNacional = false;
      this.CoberturaCP = false;
    } else {
      this.CoberturaEstado = false;
    }

    this.arrayPlayers.length = 0;
  }

  CoberturaCiudadChange(Check: boolean) {
    // console.log("Se cambio la cobertura de ciudad: " + Check);
    if (Check) {
      this.CoberturaCiudad = true;
      this.CoberturaEstado = false;
      this.CoberturaNacional = false;
      this.CoberturaCP = false;
    } else {
      this.CoberturaCiudad = false;
    }

    this.arrayPlayers.length = 0;
  }

  selectAllChange(event: any) {
    // console.log("Se cambio la seleccion:" + event);
    if (event) {

      this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
        dtElement.dtInstance.then((dtInstance: any) => {

          let tablaId = dtInstance.table().node().id;
          if (tablaId == "tablaSucursales") {
            dtElement.dtInstance.then((dtInstance: any) => {
              // console.log("Estas son las filas:"+ Object.values(dtInstance.rows()));
              dtInstance.rows().select();
            })
          }
        });
      });


    } else {

      this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
        dtElement.dtInstance.then((dtInstance: any) => {

          let tablaId = dtInstance.table().node().id;
          if (tablaId == "tablaSucursales") {
            dtElement.dtInstance.then((dtInstance: any) => {
              dtInstance.rows().deselect();
            })
          }
        });
      });
    }

  }

  selectAllChange1(event: any) {
    // console.log("Se cambio la seleccion:" + event);
    if (event) {
      

      this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
        dtElement.dtInstance.then((dtInstance: any) => {

          let tablaId = dtInstance.table().node().id;
          if (tablaId == "tablaPlayers") {
            dtElement.dtInstance.then((dtInstance: any) => {
              // console.log("Estas son las filas:"+ Object.values(dtInstance.rows()));
              let cuenta = dtInstance.rows().count();
              // console.log("Numero de filas encontradas");
              // console.log(cuenta);
              dtInstance.rows().select();
            })
          }
        });
      });


    } else {

      this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
        dtElement.dtInstance.then((dtInstance: any) => {

          let tablaId = dtInstance.table().node().id;
          if (tablaId == "tablaPlayers") {
            dtElement.dtInstance.then((dtInstance: any) => {
              dtInstance.rows().deselect();
            })
          }
        });
      });
    }

  }

  FiltrarCP() {
    let CodigoPostal = this.FiltroCP;
    this.arraySucursales.length = 0;

    if (!isNaN(CodigoPostal) && (CodigoPostal > 0 && CodigoPostal < 100000)) {
      this.drawMapMarkers();
    } else {
      //Mostrar algun mensaje de codigo postal no valido
    }
    this.rerender(false);
  }


  FiltrarEstado(){
    this.arraySucursales.length = 0;

    this.drawMapMarkers();
    this.rerender(false);
  }

  EstadoChange(event:any){
    // console.log("Esto tiene el modelo en el cambio de estado");
    // console.log(this.defaultEstado);
  }

  FiltrarCiudad(){
    this.arraySucursales.length = 0;

    this.drawMapMarkers();
    this.rerender(false);
  }

  
  getInventario() {

    if (this.fechaInicio != "" || this.fechaFin != "") {

      this.arraySucursales.forEach(element => {
        element.Inventario = "";
      });

      // console.log("Estado actual arreglo sucursales")
      // console.log( Object.values(this.arraySucursales) );

      this.fechasVacias = false;
      let arrayIdSucursales: Array<any> = [];
      this.contadorSucursalesCotizacion = 0;
      this.Cotizacion = 0;

      let objetoSuc = { idSucursal: this.arraySucursales[0].Id_Sucursal }

      let objeto = {
        FechaInicio: this.fechaInicio,
        FechaFin: this.fechaFin,
        Sucursal: arrayIdSucursales
      };

      this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
        dtElement.dtInstance.then((dtInstance: any) => {

          let tablaId = dtInstance.table().node().id;
          if (tablaId == "tablaSucursales") {

            dtElement.dtInstance.then(async (dtInstance: any) => {
              let selectedRows = dtInstance.rows({ selected: true }).count();
              let data = dtInstance.rows({ selected: true }).data();
              if (selectedRows == 0) {
                this.contadorDisponibilidadPlayers = 0;
              }

              for (let index = 0; index < selectedRows; index++) {

                //Variables para la disponibilidad
                let inventaryString = "";
                let PlayerCount = 0;
                let idPlayer = 1;
                let contadorDias: number = 0;

                const elementSuc = data[index].toString();
                arrayIdSucursales.length = 0;
                let idSucursal = elementSuc.split(',')[4];
                objetoSuc.idSucursal = idSucursal;
                arrayIdSucursales.push(objetoSuc);

                objeto.Sucursal = arrayIdSucursales;

                let resInv = await this.controllerService.getInventario(objeto).toPromise();
                let dataInv = resInv.data;
                let segundos: number = 0;

                dataInv.forEach((element: { Id_Sucursal: any; fecha: any; Segundos: any; Id_Player: any; }) => {

                  let Id_PlayerInv = element.Id_Player;
                  let fecha: DateTime = DateTime.fromISO(element.fecha);

                  if (idPlayer != Id_PlayerInv) {
                    idPlayer = Id_PlayerInv;
                    PlayerCount++;
                  }

                  element.Segundos >= 20 ? contadorDias++: null
                  // console.log("Inventario \n Sucursal:"+element.Id_Sucursal+ "\nPlayer:" +element.Id_Player+"\nFecha:" +element.fecha);

                  if(PlayerCount < 2){
                    
                    segundos = Number(element.Segundos);
                    // console.log("Sucursal:" +element.Id_Sucursal + "\nSegundos:" +element.Segundos);
  
                    let formatedFecha = fecha.toLocaleString({ day: '2-digit', month: 'short', year: "2-digit" });
                    let disponibilidad = "";
                    
                    if(segundos >= 20){
                      disponibilidad = "SI"
                    }else{
                      disponibilidad = "NO"
                    }

                    this.contadorDisponibilidadPlayers++;
  
                    let cadena = formatedFecha + " - " + disponibilidad + " \n";
                    inventaryString = inventaryString + " " + cadena;
  
                  }

                });

                inventaryString = inventaryString.trimEnd();
                inventaryString = inventaryString.trimStart();

                let itemEncontrado = this.arraySucursales.find(function (element){
                  return element.Id_Sucursal == idSucursal;
                });

                itemEncontrado!.Inventario = inventaryString;
                itemEncontrado!.Segundos = segundos;
                itemEncontrado!.Pantallas =PlayerCount;
                itemEncontrado!.DiasDisponibles = contadorDias;
                segundos >=20 ? this.contadorSucursalesCotizacion++ : null

                
                // console.log("item al que se le pone inventario y segundos");
                // console.log(itemEncontrado);
                
                // PlayerCount = 1;

              }

            })
          }
        });
      });


    } else {
      this.fechasVacias = true;
    }

  }

  //Metodo para mostrar en otra pantalla un listado de las sucursales
  //la ruta del metodo para cotizar es api/cotizacion/
  //Provisionalmente los parametros son: fecha inicial fecha final, numero de sucursales y id de red.
  //celda de seleccion, Nombre de la sucursal, num pantallas, disponibilidad , fechas seleccionadas

  getSeleccionadas() {

    this.arrayPlayers.length = 0;
    let rangoFechas = this.fechaInicio + " - " + this.fechaFin;

    this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
      dtElement.dtInstance.then(async (dtInstance: any) => {

        let tablaId = dtInstance.table().node().id;
        if (tablaId == "tablaSucursales") {

          let tempArrayPlayers: Array<Player> = [];
          let sumaCotizacion: number = 0;

          dtElement.dtInstance.then(async (dtInstance: any) => {
            let selectedRows = dtInstance.rows({ selected: true }).count();
            let data = dtInstance.rows({ selected: true }).data();

            for (let index = 0; index < selectedRows; index++) {
              const element = data[index].toString();
        
              let Sucursal = element.split(',')[1];
              let id_Sucursal = element.split(',')[4];   

              // let foundItem = this.arraySucursales.find(x => x.Id_Sucursal == id_Sucursal);    
              let foundItem = this.arraySucursales.find( function(element){
                return element.Id_Sucursal == id_Sucursal;
              })

              // console.log("Sucursal encontrada con id "+id_Sucursal +":");
              // console.log( Object.values(foundItem!) );
              let segundos = Number(foundItem!.Segundos);
              let dias = Number(foundItem!.DiasDisponibles);
              let Red = foundItem!.Id_Negocio;

              let cotiTemp = {
                // fechaInicial: this.fechaInicio,
                // fechaFinal: this.fechaFin,
                dias: dias,
                red: Red,
                sucursales: 1

                // sucursales: this.contadorSucursalesCotizacion
              }
    
              let Coti = await this.controllerService.getCotizacion(cotiTemp).toPromise();
              this.Cotizacion = Coti.data.cotizacion;
              sumaCotizacion += this.Cotizacion;

              // console.log("El valor de cotizacion es "+sumaCotizacion);
    
              let playerTemp: Player = {
                Id_Player: null,
                Fecha: rangoFechas,
                Nombre_Sucursal: Sucursal,
                Id_Sucursal: null,
                Nombre_Player: null,
                Segundos: segundos,
                Pantallas: foundItem!.Pantallas,
                Cotizacion: this.Cotizacion
              }

              if (dias > 0) {
                tempArrayPlayers.push(playerTemp);
                // this.arrayPlayers.push(playerTemp);
              }else{
                // console.log("No disponible para pautar");
              }              
            }


            // this.CotizacionMostrar =  Math.ceil(sumaCotizacion);
            // this.Cotizacion = this.CotizacionMostrar
            this.Cotizacion = Math.ceil(sumaCotizacion);
            this.interfazPlayers = true;
            this.arrayPlayers = tempArrayPlayers;
  
            this.rerender1(true);
            // this.selectAllChange1(true);
          })


        }
      });
    });

  }

  openInfoWindow(markerM: MapMarker, windowIndex: number) {

    let curIdx = 0;
    this.infoWindowsView.forEach((windowww: MapInfoWindow) => {
      if (windowIndex === curIdx) {
        windowww.open(markerM);
        curIdx++;
      } else {
        curIdx++;
      }
    })
    // this.infoWindow.open(marker);
  }

  dataRangeChange(rangeDate: any) {
    let startDate: Date = rangeDate._model.selection.start;
    let endDate: Date = rangeDate._model.selection.end;

    //Obtener valores de la fecha por separados
    let startMonth = (Number(startDate.getMonth() + 1)).toString();
    let endMonth = (Number(endDate.getMonth() + 1)).toString();
    let startDay = startDate.getDate().toString();
    let endDay = endDate.getDate().toString();

    //Validar si los datos son de 1 solo digito y de ser el caso formatearlos
    if (startMonth.length == 1) { startMonth = '0' + startMonth }
    if (endMonth.length == 1) { endMonth = '0' + endMonth }
    if (startDay.length == 1) { startDay = '0' + startDay }
    if (endDay.length == 1) { endDay = '0' + endDay }

    let FormatedstartDate = startDate.getFullYear() + "-" + startMonth + "-" + startDay;
    let FormatedEndDate = endDate.getFullYear() + "-" + endMonth + "-" + endDay;

    this.fechaInicio = FormatedstartDate;
    this.fechaFin = FormatedEndDate;

    // console.log("Fecha Inicio:" + FormatedstartDate + "\nFecha fin:" + FormatedEndDate);
  }

  backFromPlayers() {
    this.interfazPlayers = false;
  }

  cotizarFromSelectedPlayers(){


    this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
      dtElement.dtInstance.then((dtInstance: any) => {

        let tablaId = dtInstance.table().node().id;
        if (tablaId == "tablaPlayers") {

          dtElement.dtInstance.then(async (dtInstance: any) => {
            let selectedRows: number = dtInstance.rows({ selected: true }).count();
            let rows: number = dtInstance.rows({}).count();

            let factorSucursales = selectedRows / rows;
            let cotizacionNueva = this.Cotizacion * factorSucursales
            this.CotizacionMostrar = Math.ceil( cotizacionNueva);
          })
        }
      });
    });
  }

  someClickHandler(info: any): void {

    // this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
    //   dtElement.dtInstance.then((dtInstance: any) => {

    //     let tablaId = dtInstance.table().node().id;
    //     if (tablaId == "tablaPlayers") {

    //       dtElement.dtInstance.then(async (dtInstance: any) => {
    //         let selectedRows: number = dtInstance.rows({ selected: true }).count();
    //         let rows: number = dtInstance.rows({}).count();

    //         let factorSucursales = selectedRows / rows;
    //         let cotizacionNueva = this.Cotizacion * factorSucursales
    //         this.CotizacionMostrar = cotizacionNueva;

    //       })
    //     }
    //   });
    // });

    // console.log("Fila donde se hizo click:");
    // console.log(info);
  }


  constructor(private controllerService: ControllerService) { }

  ngOnInit(): void {

    this.dropDownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Seleccionar todo',
      unSelectAllText: 'Deseleccionar todo',
      itemsShowLimit: 4,
      allowSearchFilter: false,
      enableCheckAll: false
    };

    this.dtOptions[0] = {
      jQueryUI: true,
      responsive: true,
      pageLength: 10,
      language: {
        "url": "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Spanish.json",
        select: {
          rows: {
            _: "%d filas seleccionadas",
            0: "",
            1: "1 fila seleccionada"
          }
        }
      },
      dom: "rtpi",
      select: '{style:multi, selector: td:first-child}',
      columnDefs: [{
        orderable: false,
        className: 'select-checkbox',
        targets: 0
      },
      {
        targets: [3, 4, 5, 6,7],
        visible: false
      }]
    }


    this.dtOptions[1] = {
      jQueryUI: true,
      responsive: true,
      pageLength: 10,
      language: {
        "url": "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Spanish.json",
        select: {
          rows: {
            _: "%d filas seleccionadas",
            0: "",
            1: "1 fila seleccionada"
          }
        }
      },
      dom: "rtpi",
      select: '{style:multi, selector: td:first-child}',
      columnDefs: [{
        orderable: false,
        className: 'select-checkbox',
        targets: 0
      }
      ]
      // ,
      // rowCallback: (row: Node, data: any[] | Object, index:number) =>{
      //   const self = this;
      //   $('td', row).off('click');
      //   $('td', row).on('click', () =>{
      //     this.someClickHandler(data);
      //   });
      //   return row;
      // }
    }

    this.controllerService.getNegocios().subscribe(res => {

      for (let index = 0; index < res.data.length; index++) {
        let objeto: negocioItem = {
          id: res.data[index].Id_Negocio,
          name: res.data[index].Nombre_Negocio
        }
        if (objeto.name == "BANCO AZTECA COMERCIAL") {
            objeto.name = "BAZ"
        }
        this.arrayOptions.push(objeto)
      }
      this.consultedNetworks = true;
      // console.log("Redes encontradas:");
      // console.table(this.arrayOptions);

    });

    // this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //   dtInstance.init();
    // }
  }

  ngAfterViewInit(): void {
    this.dtTrigger0.next("");
    this.dtTrigger1.next("");
  }

  ngOnDestroy(): void {
    this.dtTrigger0.unsubscribe();
    this.dtTrigger1.unsubscribe();

  }

  rerender(limpiar: boolean): void {
    this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
      dtElement.dtInstance.then((dtInstance: any) => {

        let tablaId = dtInstance.table().node().id;
        if (tablaId == "tablaSucursales") {
          dtElement.dtInstance.then((dtInstance: any) => {
            //Esto es para limpiar la data de la tabla
            if (limpiar) {
              dtInstance.clear();
              console.log("--Limpiando tabla--")
            }

            //Destroying the table
            dtInstance.destroy();
            console.log("--Destruyendo tabla--");

            //Calling dtTrigger to rerender again
            this.dtTrigger0.next("");
            console.log("--Activando rerenderizacion--");


          })
        }
      });
    });
  }


  rerender1(limpiar: boolean): void {
    this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
      dtElement.dtInstance.then((dtInstance: any) => {

        let tablaId = dtInstance.table().node().id;
        if (tablaId == "tablaPlayers") {
          dtElement.dtInstance.then((dtInstance: any) => {
            //Esto es para limpiar la data de la tabla
            if (limpiar) {
              dtInstance.clear();
              console.log("--Limpiando tabla--")
            }

            //Destroying the table
            dtInstance.destroy();
            console.log("--Destruyendo tabla--");

            //Calling dtTrigger to rerender again
            this.dtTrigger1.next("");
            console.log("--Activando rerenderizacion--");


            // console.log("Se seleccionaran los players");
            // dtInstance.rows({}).select();
            // let selectedRows = dtInstance.rows({ selected: true }).count();
            // console.log("Players seleccionados:" +selectedRows);
            this.selectAllChange1(true);


          })
        }
      });
    });
  }

}

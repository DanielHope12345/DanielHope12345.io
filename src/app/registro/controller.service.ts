import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { catchError, Observable, Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ControllerService {

  base_url: string = 'http://201.149.34.171:3043/'
  httpHeaders = new HttpHeaders().set('Content-Type', 'application/json');

  constructor( private httpClient: HttpClient) { }

  getWelcomeMessage(){
    return this.httpClient.get(`${this.base_url + "api/auth"}`)
  }

  getNegocios(){

    this.httpHeaders.set('observe', 'body');
    this.httpHeaders.set('responseType', 'json');

    return this.httpClient.get<any>(`${this.base_url + "api/redes"}`, {headers: this.httpHeaders})
  }

  getSucursales(IdNegocio: any): Observable<any>{

    return this.httpClient.post<any>(`${this.base_url + "api/redes/branch"}`, IdNegocio).pipe(
      map(res => {
        return res;
      })
    )
  }

  login(objeto: any){

    let Credenciales = {
      username: objeto.usuario,
      password: objeto.password
    };

    return this.httpClient.post<any>(`${this.base_url + "api/auth/singin"}`, Credenciales, {headers: this.httpHeaders});
  }

  getPlayer(objeto: any){
    return this.httpClient.post<any>(`${this.base_url +"api/redes/player"}`, objeto)
  }

  getInventario(objeto:any){
    return this.httpClient.post<any>(`${this.base_url +"api/redes/stock"}`, objeto)
  }

  getCotizacion(objeto: any){
    return this.httpClient.post<any>(`${this.base_url + "api/cotizacion"}`, objeto)
  }

  //api/redes/stock

}

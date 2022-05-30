import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router"
import { AppComponent } from "./app.component";
import { LandingComponent } from "./landing/landing.component";
import { LoginComponent } from "./login/login.component";
import { NetworkComponent } from "./network/network.component";
import { RegistroComponent } from "./registro/registro.component";

const routes: Routes =[
    {
        path: '',
        component: LandingComponent,
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'registro',
        component: RegistroComponent,
    },
    {
        path: 'registro/network',
        component: NetworkComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
]

@NgModule({
    imports:[
        RouterModule.forRoot(routes,{
            initialNavigation: 'enabled'
        })
    ],
    exports:[
        RouterModule
    ]
})
export class AppRoutingModule{

}
import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from "./../../environments/environment"
import * as Plyr from 'plyr';


@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  public player: any;
  public baseHref = environment.baseHref;

  constructor() {}

  ngOnInit(): void {
    this.player = new Plyr('#plyrID', { 
      autoplay: true,
      clickToPlay: false
    });
  }

}

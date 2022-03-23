/* tslint:disable:quotemark radix */
import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpService} from '../_services/http.service';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  gaugeType = 'arch';
  gaugeSize = 125;
  humidityText = '%';
  flowText = "L/min";

  values: any = {};

  selected = "Humedad";

  devices: any = [];

  idBox = "None";

  device: any;

  constructor(private httpService: HttpService, public datepipe: DatePipe) {
  }


  ngOnInit(): void {
    this.setType();
    setInterval(() => { this.lastReport(this.devices[0].idbox); }, 30 * 1000);
  }

  lastReport(IdBox: number): void {
    IdBox = parseInt(this.idBox);
    if (this.selected === 'Flujo') {
      this.httpService.get_api_id("LastFlow", `${IdBox}`).subscribe((res: any) => {
        this.values = res.data;
      }, _ => alert("Error De conexión"));
    }
    else{
      this.httpService.get_api_id("LastHumidity", `${IdBox}`).subscribe((res: any) => {
        this.values = res.data;
      }, _ => alert("Error De conexión"));
    }
  }

  setType(): void {
    if (this.selected === "Flujo") {
      this.httpService.get_api("FlowBoxes").subscribe((res: any) => {
        this.devices = res.data;
        this.idBox = this.devices[0].idbox;
        this.lastReport(this.devices[0].idbox);
        this.device = this.devices[0];

      }, _ => alert("Error De conexión"));
    }
    else{
      this.httpService.get_api("HumidityBoxes").subscribe((res: any) => {
        this.devices = res.data;
        this.idBox = this.devices[0].idbox;
        this.lastReport(this.devices[0].idbox);
        this.device = this.devices[0];
      }, _ => alert("Error De conexión"));
    }
  }

  updateDevice(id: number): void{
    if (this.selected === "Flujo"){
      this.httpService.get_api_id("FlowBox", id).subscribe((res: any) => {
        this.device = res.data;
      }, _ => alert("Error De conexión"));
    }
    else{
      this.httpService.get_api_id("HumidityBox", id).subscribe((res: any) => {
        this.device = res.data;
      }, _ => alert("Error De conexión"));
    }

  }

  round(value: number, decimals: number): number {
    return (Math.round(value * 10 ** decimals) / 10 ** decimals);
  }
}

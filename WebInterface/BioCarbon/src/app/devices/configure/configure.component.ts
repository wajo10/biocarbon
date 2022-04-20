import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../_services/http.service';

@Component({
  selector: 'app-configure',
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss']
})


export class ConfigureComponent implements OnInit {

  selected = 'Humedad';
  devices: any = [];
  device: any;
  settings: any;
  idBox = 'None';

  constructor(private httpService: HttpService) {
  }


  ngOnInit(): void {
    this.setType();
    console.log(this.device);
  }

  setType(): void {
    if (this.selected === 'Humedad') {
      this.httpService.get_api('HumidityBoxes').subscribe((res: any) => {
        this.devices = res.data;
        this.idBox = this.devices[0].idBox;
        this.device = this.devices[0];
        this.updateSettings(this.idBox);
      }, _ => alert('Error De conexión'));
    } else {
      this.httpService.get_api('FlowBpmoxes').subscribe((res: any) => {
        this.devices = res.data;
        this.idBox = this.devices[0].idBox;
        this.device = this.devices[0];
        this.updateSettings(this.idBox);
      }, _ => alert('Error De conexión'));
    }
  }

  updateSettings(id: any): void {
    if (this.selected === 'Humedad'){
      this.httpService.get_api_id('HumidityConfiguration', id).subscribe((res: any) => {
        this.settings = res.data;
      });
    }
    else{
      this.httpService.get_api_id('FlowConfiguration', id).subscribe((res: any) => {
        this.settings = res.data;
      });
    }

  }

  updateDevice(id): void{
    if (this.selected === 'Flujo'){
      this.httpService.get_api_id('FlowBox', id).subscribe((res: any) => {
        this.device = res.data;
      }, _ => alert('Error De conexión'));
    }
    else{
      this.httpService.get_api_id('HumidityBox', id).subscribe((res: any) => {
        this.device = res.data;
      }, _ => alert('Error De conexión'));
    }

  }

  modifyDevice(): void {
    const name = (document.getElementById('name') as HTMLInputElement).value;
    let location = (document.getElementById('location') as HTMLInputElement).value;
    const type = this.selected === 'Humedad';

    location = (location !== '') ? location : '0';

    if (name === '' || name === undefined){
      alert('Por favor verifique que las entradas sean válidas');
      return;
    }

    const set = {
      idBox: this.idBox,
      name,
      location,
    };
    console.log(set);
    if (this.selected === 'Humedad'){
      this.httpService.put_api('DeviceSettings', JSON.parse(JSON.stringify(set))).subscribe(_ =>
        {
          this.settings = set;
          alert('Dispositivo modificado exitosamente');
        },
        _ => alert('Error de conexión con el servidor'));
    }
    else{
      this.httpService.put_api('FlowSettings', JSON.parse(JSON.stringify(set))).subscribe(_ =>
        {
          this.settings = set;
          alert('Dispositivo modificado exitosamente');
        },
        _ => alert('Error de conexión con el servidor'));
    }


  }
}

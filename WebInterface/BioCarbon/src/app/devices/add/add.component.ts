import { Component, OnInit } from '@angular/core';
import {HttpService} from '../../_services/http.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

  selected = 'Humedad';
  device: any;
  settings: any;

  constructor(private httpService: HttpService) {
  }


  ngOnInit(): void {
    console.log(this.device);
  }



  addDevice(): void {
    const name = (document.getElementById('name') as HTMLInputElement).value;
    let location = (document.getElementById('location') as HTMLInputElement).value;
    const idBox = (document.getElementById('iddevice') as HTMLInputElement).value;

    location = (location !== '') ? location : '0';

    if (name === '' || name === undefined || idBox === '' || idBox === undefined){
      alert('Por favor verifique que las entradas sean válidas');
      return;
    }

    const set = {
      idBox,
      name,
      location
    };
    console.log(set);
    if (this.selected === 'Humedad'){
      this.httpService.post_api('HumidityBox', JSON.parse(JSON.stringify(set))).subscribe(_ =>
        {
          this.settings = set;
          alert('Dispositivo Agregado exitosamente');
        },
        _ => alert('Error de conexión con el servidor'));
    }
    else{
      this.httpService.post_api('FlowBox', JSON.parse(JSON.stringify(set))).subscribe(_ =>
        {
          this.settings = set;
          alert('Dispositivo Agregado exitosamente');
        },
        _ => alert('Error de conexión con el servidor'));
    }
  }

}

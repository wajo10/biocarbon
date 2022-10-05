import {Component, OnInit} from '@angular/core';
import {NgbCalendar, NgbCalendarGregorian, NgbDate, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {HttpService} from '../_services/http.service';
import {DatePipe} from '@angular/common';
import {saveAs} from 'file-saver';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})

export class ChartsComponent implements OnInit {
  hoveredDate: NgbDate | null = null;
  today: NgbDate = new NgbCalendarGregorian().getToday();
  fromDate: NgbDate = new NgbDate(this.today.year, this.today.month - 1, this.today.day - 3);
  toDate: NgbDate = new NgbDate(this.today.year, this.today.month, this.today.day + 1);

  values: any = {};

  selected = 'Humedad';

  devices: any = [];

  idBox = 'None';

  device: any;
  isCalibration: boolean;


  humidityVars = ['sensora', 'sensorb', 'sensorc', 'sensord', 'sensore'];
  rawHumidityVars = ['rawsensora', 'rawsensorb', 'rawsensorc', 'rawsensord', 'rawsensore'];
  selectedVars = this.humidityVars;
  humidityUnits = {
    [this.selectedVars[0]]: {
      title: 'Sensor 1',
      yAxis: {
        title: '%',
        crosshairTooltip: {enable: true}
      }
    },
    [this.selectedVars[1]]: {
      title: 'Sensor 2',
      yAxis: {
        title: '%',
        crosshairTooltip: {enable: true}
      }
    },
    [this.selectedVars[2]]: {
      title: 'Sensor 3',
      yAxis: {
        title: '%',
        crosshairTooltip: {enable: true}
      }
    },
    [this.selectedVars[3]]: {
      title: 'Sensor 4',
      yAxis: {
        title: '%',
        crosshairTooltip: {enable: true}
      }
    },
    [this.selectedVars[4]]: {
      title: 'Sensor 5',
      yAxis: {
        title: '%',
        crosshairTooltip: {enable: true}
      }
    }
  };
  flowVars = ['flow1', 'flow2', 'flow3', 'flow4', 'flow5'];
  flowUnits = {
    flow1: {
      title: 'Flujo 1',
      yAxis: {
        title: 'L/min',
        crosshairTooltip: {enable: true}
      }
    },
    flow2: {
      title: 'Flujo 2',
      yAxis: {
        title: 'L/min',
        crosshairTooltip: {enable: true}
      }
    },
    flow3: {
      title: 'Flujo 3',
      yAxis: {
        title: 'L/min',
        crosshairTooltip: {enable: true}
      }
    },
    flow4: {
      title: 'Flujo 4',
      yAxis: {
        title: 'L/min',
        crosshairTooltip: {enable: true}
      }
    },
    flow5: {
      title: 'Flujo 5',
      yAxis: {
        title: 'L/min',
        crosshairTooltip: {enable: true}
      }
    },
  };


  constructor(private calendar: NgbCalendar, public formatter: NgbDateParserFormatter, private httpService: HttpService,
              public datepipe: DatePipe) {
    this.today = new NgbCalendarGregorian().getToday();
    this.fromDate = new NgbDate(this.today.year, this.today.month - 1, this.today.day - 3);
    this.toDate = calendar.getNext(this.today, 'd', 1);
    this.isCalibration = false;
  }

  // tslint:disable-next-line:ban-types
  public primaryXAxis: Object;
  public chartData: {};
  public primaryYAxis: Object;
  public zoom: Object;
  public crosshair: Object;
  public marker: Object;
  public tooltip: Object;

  ngOnInit(): void {
    this.setType();
    this.primaryXAxis = {
      valueType: 'DateTime',
      labelFormat: 'MMMdd HH:mm:ss',
      intervalType: 'Auto',
      title: 'Fecha',
      crosshairTooltip: {enable: true}
    };
    this.zoom = {
      enableMouseWheelZooming: true,
      enablePinchZooming: true,
      enableSelectionZooming: true,
      mode: 'X'
    };
    this.crosshair = {enable: true};
    this.marker = {visible: true, width: 3, height: 3, shape: 'Diamond', dataLabel: {visible: true, position: 'Top'}};
    this.tooltip = {enable: true};

  }


  getChartData(variables: string[]): void {
    let data: any = [];
    this.chartData = {};
    variables.forEach(vari => {
      this.values.forEach(report => {
        const date = this.datepipe.transform(report.datetime, 'yyyy-MM-dd HH:mm:ss');
        const json = {x: date, y: report[vari]};
        console.log(json);
        data.push(json);
      });
      this.chartData[vari] = data;
      data = [];
    });

  }

  setType(): void {
    if (this.selected === 'Humedad') {
      this.httpService.get_api('HumidityBoxes').subscribe((res: any) => {
        this.devices = res.data;
        this.idBox = this.devices[0].idbox;
        this.getReports();
        console.log(res);
        this.device = this.devices[0];
      }, _ => alert('Error De conexión'));
    } else {
      this.httpService.get_api('FlowBoxes').subscribe((res: any) => {
        this.devices = res.data;
        this.idBox = this.devices[0].idbox;
        this.getReports();
        this.device = this.devices[0];
      }, _ => alert('Error De conexión'));
    }
  }

  updateDevice(id): void {
    if (this.selected === 'Flujo') {
      this.httpService.get_api_id('FlowBox', id).subscribe((res: any) => {
        this.device = res.data;
      }, _ => alert('Error De conexión'));
    } else {
      this.httpService.get_api_id('HumidityBox', id).subscribe((res: any) => {
        this.device = res.data;
      }, _ => alert('Error De conexión'));
    }

  }

  getReports(): void {
    if (this.selected === 'Humedad') {
      this.httpService.put_api('HumidityReports', {
        idbox: this.idBox,
        fromdate: this.formatter.format(this.fromDate),
        todate: this.formatter.format(this.toDate),
        iscalibration: this.isCalibration
      }).subscribe((res: any) => {
        this.values = res.data;
        console.log(res);
        if (this.isCalibration) {
          this.selectedVars = this.rawHumidityVars;
          this.updateHumidityUnits();
          this.getChartData(this.rawHumidityVars);
        } else {
          this.selectedVars = this.humidityVars;
          this.updateHumidityUnits();
          this.getChartData(this.humidityVars);
        }
      }, _ => alert('Error De conexión'));
    } else {
      this.httpService.put_api('FlowReports', {
        idbox: this.idBox,
        fromdate: this.formatter.format(this.fromDate),
        todate: this.formatter.format(this.toDate),
        iscalibration: this.isCalibration
      }).subscribe((res: any) => {
        this.values = res.data;
        console.log(res.data);
        this.getChartData(this.flowVars);
      }, _ => alert('Error De conexión'));
    }
  }

  exportCSV(): void {
    const report = [];
    let type = '';
    if (this.selected === 'Humedad') {
      for (const med of this.values) {
        report.push({
          timestamp: this.datepipe.transform(med.date, 'yyyy-MM-dd HH:mm:ss'), Sensor1: med.sensora, Sensor2: med.sensorb,
          Sensor3: med.sensorc, Sensor4: med.sensord, Sensor5: med.sensore
        });
      }
      type = 'Humidity';
    } else {
      for (const med of this.values) {
        report.push({
          timestamp: this.datepipe.transform(med.date, 'yyyy-MM-dd HH:mm:ss'), Flow1: med.flow1, Flow2: med.flow2,
          Flow3: med.flow3, Flow4: med.flow4, Flow5: med.flow5
        });
      }
      type = 'Atmospheric';
    }
    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(report); // Sale Data
      const workbook = {Sheets: {data: worksheet}, SheetNames: ['data']};
      const excelBuffer: any = xlsx.write(workbook, {bookType: 'xlsx', type: 'array'});

      this.saveAsExcelFile(excelBuffer, type + 'Report');
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    saveAs(
      data,
      fileName + this.datepipe.transform(new Date().toDateString(), 'yyyy-MM-dd') + EXCEL_EXTENSION
    );
  }

  onDateSelection(date: NgbDate): void {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    if (this.toDate != null && this.fromDate != null) {
      this.fromDate = new NgbDate(this.fromDate.year, this.fromDate.month, this.fromDate.day);
      this.toDate = new NgbDate(this.toDate.year, this.toDate.month, this.toDate.day);
      this.getReports();
    }

  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  updateHumidityUnits(): void {
    this.humidityUnits = {
      [this.selectedVars[0]]: {
        title: 'Sensor 1',
        yAxis: {
          title: '%',
          crosshairTooltip: {enable: true}
        }
      },
      [this.selectedVars[1]]: {
        title: 'Sensor 2',
        yAxis: {
          title: '%',
          crosshairTooltip: {enable: true}
        }
      },
      [this.selectedVars[2]]: {
        title: 'Sensor 3',
        yAxis: {
          title: '%',
          crosshairTooltip: {enable: true}
        }
      },
      [this.selectedVars[3]]: {
        title: 'Sensor 4',
        yAxis: {
          title: '%',
          crosshairTooltip: {enable: true}
        }
      },
      [this.selectedVars[4]]: {
        title: 'Sensor 5',
        yAxis: {
          title: '%',
          crosshairTooltip: {enable: true}
        }
      }
    };
  }

}

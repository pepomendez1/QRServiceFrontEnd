import {
  Component,
  OnInit,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { AgCharts } from 'ag-charts-angular';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { AgChartOptions } from 'ag-charts-community';
import { FormControl } from '@angular/forms';
import { AmountDisplayComponent } from '../../common/amount-display/amount-display.component';
import { InvestmentService, Positions } from '../investment.service';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [
    CommonModule,
    AgCharts,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatRadioModule,
    MatIcon,
    AmountDisplayComponent,
    MatProgressSpinnerModule,
  ],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-in-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0.5s ease-in-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
  templateUrl: './returns.component.html',
  styleUrl: './returns.component.scss',
})
export class ReturnsComponent implements OnInit, AfterViewInit, OnDestroy {
  private resizeObserver!: ResizeObserver;
  problemImg: SafeHtml | null = null;
  public showLabel: boolean = true;
  public zeroReturns: boolean = false;
  public loading = true;
  public errors: string[] = [];
  public animating = false;
  public generatingReport: boolean = false;
  public useMockData: boolean = false;
  public noReturns: boolean = false;
  public selectedPeriodString: string = '';
  public chartOptions: AgChartOptions = {};
  public period: number = 0;
  public data: Positions = [];
  public currentTotal: number = 0;
  public selectedPeriodToTimeLapse: string = 'total';

  periods = [
    { value: 1, label: '1 mes' },
    { value: 6, label: '6 meses' },
    { value: 12, label: '1 año' },
    { value: 0, label: 'Todo' },
  ];

  public mockData: any[] = [
    { label: 'Jun', value: 1200 },
    { label: 'Jul', value: 3200 },
    { label: 'Aug', value: 4200 },
    { label: 'Sep', value: 2100 },
    { label: 'Oct', value: 1200 },
    { label: 'Nov', value: 1110 },
    { label: 'Dec', value: 520 },
    { label: 'Jan', value: 210 },
    { label: 'Feb', value: 210 },
    { label: 'Mar', value: 130 },
    { label: 'Apr', value: 140 },
    { label: 'May', value: 520 },
    { label: 'Jun', value: 160 },
    { label: 'Jul', value: 720 },
    { label: 'Aug', value: 1180 },
    { label: 'Sep', value: 910 },
  ];
  formatNumber = (value: number) => {
    return `$${value.toFixed().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  };

  constructor(
    private snackBarService: SnackbarService,
    private cdr: ChangeDetectorRef,
    private svgLibrary: SvgLibraryService,
    private snackBar: MatSnackBar,
    private investmentService: InvestmentService,
    private elementRef: ElementRef,
    private ngZone: NgZone
  ) {}
  // onPeriodChange(value: number) {
  //   console.log('Selected period:', value);
  //   // Add your logic for period selection here
  // }
  ngOnInit(): void {
    this.svgLibrary.getSvg('problem').subscribe((svgContent) => {
      this.problemImg = svgContent; // SafeHtml type to display SVG dynamically
    });
    this.calculatePeriodString(this.period);
    this.getChartData();
  }

  ngAfterViewInit(): void {
    // Create a ResizeObserver to observe changes in the component's size
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        // Toggle the label visibility based on width
        this.ngZone.run(() => {
          this.showLabel = width > 500;
        });
      }
    });

    // Start observing the component
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    // Disconnect the observer when the component is destroyed
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private calculateSelectedTotal(data: Positions) {
    this.currentTotal = 0;
    data.forEach((d: any) => {
      this.currentTotal += d.value;
    });
  }

  private getChartData() {
    console.log('Current chart theme:', this.chartOptions.theme);
    this.errors = [];
    this.loading = true;

    if (this.useMockData) {
      this.data = this.mockData;
      this.loading = false;
      this.chartOptions = this.setChartData(this.data);
      this.calculateSelectedTotal(this.data);
      return;
    } else {
      this.investmentService
        .getInvestmentsPositionsByPeriod('MONTH')
        .subscribe({
          next: (data: Positions) => {
            if (!data || data.length === 0) {
              this.loading = false;
              this.noReturns = true;
              this.errors.push('No investments found');
              return;
            }
            // uncomment to test no returns situation
            // this.noReturns = true;
            //this.data = <any>[];

            this.data = data;

            // Check if all returns are 0
            const allZeroReturns = this.data.every((item) => item.value === 0);
            this.zeroReturns = allZeroReturns;

            this.loading = false;
            this.chartOptions = this.setChartData(this.data);
            this.calculateSelectedTotal(this.data);
          },
          error: (error: any) => {
            this.loading = false;
            this.errors.push(error.message);
            this.handleError(error);
          },
        });
    }
  }

  private handleError(error: any) {
    const config = new MatSnackBarConfig();
    config.duration = 5000;
    config.horizontalPosition = 'center';
    config.verticalPosition = 'bottom';
    this.snackBar.open(error.message, 'Ok', config);
  }

  onPeriodChange(value: number) {
    if (value === 1) {
      console.log('solicitando posiciones por día');
      this.loading = true;
      this.investmentService.getInvestmentsPositionsByPeriod('DAY').subscribe({
        next: (data: Positions) => {
          if (!data || data.length === 0) {
            this.loading = false;
            this.noReturns = true;
            this.errors.push('No investments found');
            return;
          }
          // Format the label to dd/MM/yy
          this.data = data.map((item) => ({
            ...item,
            label: this.formatDateString(item.label), // Format the label here
          }));
          // Check if all returns are 0
          const allZeroReturns = this.data.every((item) => item.value === 0);
          this.zeroReturns = allZeroReturns;

          this.loading = false;
          this.period = value;
          this.calculatePeriodString(value);
          this.chartOptions = this.setChartData(this.data);
          this.calculateSelectedTotal(this.data);
        },
        error: (error: any) => {
          this.loading = false;
          this.errors.push(error.message);
          this.handleError(error);
        },
      });
    } else {
      this.getChartData();
      this.period = value;
      this.calculatePeriodString(value);
      let newData = this.data.slice(-value);
      this.calculateSelectedTotal(newData);
      this.chartOptions = this.setChartData(newData);
    }
  }
  private formatDateString(dateString: string): string {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${day}/${month}/${year.substring(2)}`;
  }
  setChartData(data: any[]): AgChartOptions {
    const body = document.querySelector('body');
    const isDarkMode = body?.classList.contains('app-dark');
    const accentColorLighten = getComputedStyle(document.documentElement)
      .getPropertyValue('--bar-chart-color')
      .trim();
    return {
      // Data: Data to be displayed in the chart
      data: data,
      series: [
        {
          type: 'bar',
          xKey: 'label',
          yKey: 'value',
          fill: accentColorLighten,
          stroke: accentColorLighten,
          tooltip: {
            renderer: ({ datum, xKey, yKey }) => {
              return {
                title: datum[xKey],
                content: this.formatNumber(datum[yKey]),
              };
            },
          },
        },
      ],
      axes: [
        {
          type: 'category',
          position: 'bottom',
          line: {
            stroke: isDarkMode ? '#666666' : '#cccccc', // Dark/light axis line color
          },
          tick: {
            stroke: isDarkMode ? '#666666' : '#cccccc', // Dark/light tick color
          },
          label: {
            color: isDarkMode ? '#bbbbbb' : '#333333', // Dark/light axis label color
          },
        },
        {
          type: 'number',
          position: 'left',
          line: {
            stroke: isDarkMode ? '#666666' : '#cccccc',
          },
          tick: {
            stroke: isDarkMode ? '#666666' : '#cccccc',
          },
          label: {
            color: isDarkMode ? '#bbbbbb' : '#333333',
            formatter: ({ value }) => this.formatNumber(value),
          },
        },
      ],
      background: {
        fill: 'transparent',
      },
    };
  }

  calculatePeriodString(period: number) {
    period = +period;

    switch (period) {
      case 1:
        this.selectedPeriodToTimeLapse = 'mensual';
        break;
      case 6:
        this.selectedPeriodToTimeLapse = 'en seis meses';
        break;
      case 12:
        this.selectedPeriodToTimeLapse = 'anual';
        break;
      case 0:
        this.selectedPeriodToTimeLapse = 'total';
        break;
    }
    if (period === 0) {
      this.selectedPeriodString = '';
      this.selectedPeriodToTimeLapse = 'total';
      return;
    }

    // Use date to ge the range of the period
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - period);
    const endDate = new Date();
    this.selectedPeriodString =
      startDate.toLocaleDateString('es-AR', {
        month: 'short',
        year: 'numeric',
      }) +
      ' - ' +
      endDate.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
  }

  private calculateFromDate(period: number): string {
    const currentDate = new Date(); // Today's date
    if (period === 0) {
      // For 'Todo', use a very old date
      return '2000-01-01';
    }

    // Subtract months based on the period
    const fromDate = new Date(currentDate);
    fromDate.setMonth(fromDate.getMonth() - period);

    // Format the date as `YYYY-MM-DD`
    return fromDate.toISOString().split('T')[0];
  }

  onDownloadReport() {
    const selectedPeriod = this.period; // Get the current selected period
    this.downloadReport(selectedPeriod);
  }

  downloadReport(selectedPeriod: number) {
    this.generatingReport = true;
    console.log('Downloading investment report');

    // Determine period string and months for trimming
    const fromDate = this.calculateFromDate(selectedPeriod);

    this.investmentService.getInvestmentReport(fromDate).subscribe({
      next: (data: any) => {
        if (!data || data.length === 0) {
          this.snackBarService.openInfo(
            'No tenés suscripciones ni rescates en el período seleccionado',
            true,
            3000
          );
          this.generatingReport = false;
          return;
        }
        // Map the data into CSV format
        const csvData = data.map((entry: any) => ({
          'Fecha y Hora': `"${new Date(entry.date_time).toLocaleString()}"`,
          'ID de Transacción': entry.id_concat,
          Valor: entry.value,
          Tipo: entry.type,
        }));

        const csvContent = this.convertToCSV(csvData);

        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'reporte_inversiones.csv');
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        console.log('Se descargó el reporte de suscripciones y rescates');
        this.snackBarService.openSuccess(
          'Se descargó el reporte de suscripciones y rescates',
          true,
          3000
        );
        document.body.removeChild(link);
        this.generatingReport = false;
      },
      error: (err) => {
        this.snackBarService.openError(
          'Error obteniendo reporte de suscripciones:',
          true
        );
        console.error('Error obteniendo reporte de suscripciones:', err);
        this.generatingReport = false;
      },
    });
  }

  convertToCSV(objArray: any[]): string {
    const array = [Object.keys(objArray[0])].concat(objArray);

    return array
      .map((it) => {
        return Object.values(it).toString();
      })
      .join('\n');
  }
}

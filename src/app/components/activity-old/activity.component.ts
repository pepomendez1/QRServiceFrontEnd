import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TreasuryService } from 'src/app/services/treasury.service';

interface Activity {
  description: string;
  amount: number;
  created_at: Date;
  status: string;
  balance: number;
  currency: string;
  type: string;
  contact_name: string;
}

interface ActivityGroup {
  [key: string]: Activity[];
}

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
})
export class ActivityComponent implements OnInit, AfterViewInit {
  @ViewChild('activityList') activityList!: ElementRef;
  @ViewChild('filters') filters!: ElementRef;

  dataSource: MatTableDataSource<Activity>;
  displayedColumns: string[] = [
    'description',
    'status',
    'paymentMethod',
    'amount',
    'balance',
    'options',
  ];
  groupedActivities: ActivityGroup;
  statusOptions: string[] = ['Todas', 'Completada', 'Pendiente', 'Cancelada'];
  filteredActivities: Activity[] = [];
  currentGroupingCriteria: string = 'date';
  startDate: Date | null = null;
  endDate: Date | null = null;
  availableAmount: number = 0;
  // Definimos las opciones de period y type
  periodOptions: string[] = ['Última semana', 'Último mes', 'Último año'];
  typeOptions: string[] = ['Transferencia', 'Pago con débito', 'Rechazado'];
  activities: Activity[] = [];
  isLoading = false;
  selectedPeriod: string = 'Última semana';

  constructor(
    private treasuryService: TreasuryService,
    private renderer: Renderer2  // Agrega esta línea
  ) {
    this.dataSource = new MatTableDataSource(this.activities);
    this.groupedActivities = {};
  }

  ngOnInit(): void {
    const defaultPeriod = 'Última semana';
    this.fetchActivities(defaultPeriod);  // Fetch activities with the default period
  }

  ngAfterViewInit(): void {
    this.adjustActivityListHeight();

    window.addEventListener('resize', () => {
      this.adjustActivityListHeight();
    });
  }

  private adjustActivityListHeight(): void {
    if (this.filters && this.activityList) {  // Asegúrate de que ambos elementos existan
      const filtersHeight = this.filters.nativeElement?.offsetHeight || 0;
      const availableHeight = window.innerHeight - filtersHeight;
      this.renderer.setStyle(this.activityList.nativeElement, 'max-height', `${availableHeight}px`);
    }
  }

  private fetchActivities(period: string): void {
    this.isLoading = true;  // Show preloader
    this.treasuryService.getTransactionsByPeriod(period).subscribe(
      (data: any) => {
        this.activities = data.movements.map((activity: any) => ({
          ...activity,
          created_at: new Date(activity.created_at)
        }));
        this.filteredActivities = this.activities;
        this.groupAndSort(this.currentGroupingCriteria);
        this.isLoading = false;  // Hide preloader
      },
      error => {
        console.error('Error fetching activities', error);
        this.isLoading = false;  // Hide preloader even in case of error
      }
    );
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod = period;  // Actualiza el valor seleccionado
    this.fetchActivities(period);
  }

  goToDirectTransfer(element: Activity): void {
    console.log(`Volver a transferir a: ${element.description}`);
  }

  viewDetails(element: Activity): void {
    console.log(`Ver detalles de la transacción: ${element.description}`);
  }

  formatAmount(amount: number, currency: string, type: string): string {
    const sign = type === 'cash_in' ? '+' : type === 'cash_out' ? '-' : '';
    return `${sign}${currency} ${Math.abs(amount).toFixed(2)}`;
  }

  getAmountClass(amount: number): string {
    return amount < 0 ? 'text-negative' : 'text-positive';
  }

  disputeTransaction(element: Activity): void {
    console.log(`Iniciar disputa para la transacción: ${element.description}`);
  }

  getOptionsForActivity(activity: Activity): any[] {
    if (activity.description.includes('Transferencia')) {
      return [
        {
          label: 'Volver a transferir',
          action: () => this.goToDirectTransfer(activity),
        },
        { label: 'Ver detalles', action: () => this.viewDetails(activity) },
      ];
    } else if (activity.description.includes('Pago de factura')) {
      return [
        { label: 'Ver detalles', action: () => this.viewDetails(activity) },
        { label: 'Disputar', action: () => this.disputeTransaction(activity) },
      ];
    } else if (activity.description.includes('Inversión')) {
      return [
        { label: 'Ver detalles', action: () => this.viewDetails(activity) },
      ];
    } else {
      return [
        { label: 'Ver detalles', action: () => this.viewDetails(activity) },
        { label: 'Disputar', action: () => this.disputeTransaction(activity) },
      ];
    }
  }

  getInitials(name: string): string {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('');
    return initials.toUpperCase();
  }

  groupByDate(activities: Activity[]): ActivityGroup {
    return activities.reduce((groups: ActivityGroup, activity: Activity) => {
      const date = activity.created_at.toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
      return groups;
    }, {});
  }

  groupByType(activities: Activity[]): ActivityGroup {
    return activities.reduce((groups: ActivityGroup, activity: Activity) => {
      const type = activity.description;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(activity);
      return groups;
    }, {});
  }

  groupByContact(activities: Activity[]): ActivityGroup {
    return activities.reduce((groups: ActivityGroup, activity: Activity) => {
      const contact = activity.description;
      if (!groups[contact]) {
        groups[contact] = [];
      }
      groups[contact].push(activity);
      return groups;
    }, {});
  }

  sortGroupsByDate(
    groups: ActivityGroup,
    ascending: boolean = true
  ): ActivityGroup {
    const sortedGroups: string[] = Object.keys(groups).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return ascending
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
    return sortedGroups.reduce((sorted: ActivityGroup, key: string) => {
      sorted[key] = groups[key];
      return sorted;
    }, {});
  }

  applyTextFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredActivities = this.activities.filter(
      (activity) =>
        activity.description.toLowerCase().includes(filterValue) ||
        activity.description.toLowerCase().includes(filterValue)
    );
    this.groupAndSort(this.currentGroupingCriteria); // Agrupa y ordena según el criterio actual
  }

  applyStatusFilter(status: string): void {
    if (status === 'Todas') {
      this.filteredActivities = this.activities;
    } else {
      this.filteredActivities = this.activities.filter(
        (activity) => activity.status === status
      );
    }
    this.groupAndSort(this.currentGroupingCriteria); // Agrupa y ordena según el criterio actual
  }

  applyDateFilter(): void {
    if (this.startDate && this.endDate) {
      this.filteredActivities = this.activities.filter(
        (activity) =>
          activity.created_at >= this.startDate! && activity.created_at <= this.endDate!
      );
    } else if (this.startDate) {
      this.filteredActivities = this.activities.filter(
        (activity) => activity.created_at >= this.startDate!
      );
    } else if (this.endDate) {
      this.filteredActivities = this.activities.filter(
        (activity) => activity.created_at <= this.endDate!
      );
    } else {
      this.filteredActivities = this.activities; // Si no se selecciona ninguna fecha, muestra todas las actividades
    }

    this.groupAndSort(this.currentGroupingCriteria); // Reagrupa y ordena según el criterio actual
  }

  // Método para restablecer los filtros
  resetFilters(): void {
    this.startDate = null;
    this.endDate = null;
    this.filteredActivities = this.activities;
    this.groupAndSort(this.currentGroupingCriteria);
  }

  groupAndSort(criteria: string): void {
    let groupedActivities: ActivityGroup;
    switch (criteria) {
      case 'date':
        groupedActivities = this.groupByDate(this.filteredActivities);
        break;
      case 'type':
        groupedActivities = this.groupByType(this.filteredActivities);
        groupedActivities = this.sortGroupsByDate(groupedActivities);
        break;
      case 'contact':
        groupedActivities = this.groupByContact(this.filteredActivities);
        groupedActivities = this.sortGroupsByDate(groupedActivities);
        break;
      default:
        groupedActivities = this.groupByDate(this.filteredActivities);
    }
    this.groupedActivities = groupedActivities;
    this.currentGroupingCriteria = criteria;
  }
}

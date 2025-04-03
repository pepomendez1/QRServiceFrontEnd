import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { CostConfig, FinancialCommissionOption, CostCommissionOption } from '../costconfig.dto';
import { CostsService } from '../costs.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-costs-payment-link',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatButtonModule,
    MatCheckbox,
  ],
  templateUrl: './costs-payment-link.html',
  styleUrls: ['./costs-payment-link.scss']
})
export class CostsPaymentLinkComponent implements OnInit {
  @Input() config!: CostConfig;
  isLoading = false;
  selectedDebitOption: number | null = null;
  selectedCreditOption: number | null = null;
  installmentsEnabled = false;
  selectedInstallment: number | null = null;
  initialActiveInstallmentId: number | null = null;

  constructor(private costsService: CostsService) {}

    initialDebitOption: number | null = null;
    initialCreditOption: number | null = null;
    selectedInstallments: number[] = [];
    initialActiveInstallments: number[] = [];


    ngOnInit(): void {
        const debit = this.getDebitOptions().find(o => o.active);
        this.selectedDebitOption = debit?.id ?? null;
        this.initialDebitOption = this.selectedDebitOption;
        const credit = this.getCreditOptions().find(o => o.active);
        this.selectedCreditOption = credit?.id ?? null;
        this.initialCreditOption = this.selectedCreditOption;

        const activeInstallments = this.getInstallmentOptions()
            .filter(i => i.active)
            .map(i => i.installments);

        this.selectedInstallments = [...activeInstallments];
        this.initialActiveInstallments = [...activeInstallments];
        this.installmentsEnabled = activeInstallments.length > 0;
    }



  getDebitOptions(): CostCommissionOption[] {
    return this.config?.transactional_commission?.debit_card?.options || [];
  }

  getCreditOptions(): CostCommissionOption[] {
    return this.config?.transactional_commission?.credit_card?.options || [];
  }

  getCreditLabel(): string {
    const option = this.getCreditOptions().find(o => o.id === this.selectedCreditOption);
    return option ? `${(option.commission).toFixed(2)}%` : 'costo base';
  }


  getInstallmentOptions(): FinancialCommissionOption[] {
  const allowedIds = [112, 113, 114, 116, 119, 122];
  return (
    this.config?.financial_commission?.without_interest?.filter(option =>
      allowedIds.includes(option.id)
    ) || []
  );
}

  selectDebit(id: number): void {
    this.selectedDebitOption = id;
  }

  selectCredit(id: number): void {
    this.selectedCreditOption = id;
  }

  hasChanges(): boolean {
    const changedInstallments =
        this.initialActiveInstallments.sort().join(',') !== this.selectedInstallments.sort().join(',');
    return (
        changedInstallments ||
        this.initialDebitOption !== this.selectedDebitOption ||
        this.initialCreditOption !== this.selectedCreditOption
    );
    }

toggleInstallmentSelection(value: number): void {
  const index = this.selectedInstallments.indexOf(value);
  if (index === -1) {
    this.selectedInstallments.push(value);
  } else {
    this.selectedInstallments.splice(index, 1);
  }
}


  updateCommission(): void {
    this.isLoading = true;

    this.config.financial_commission.without_interest =
        this.getInstallmentOptions().map(opt => ({
        ...opt,
        active: this.selectedInstallments.includes(opt.installments)
        }));

    this.initialActiveInstallments = [...this.selectedInstallments];
    this.initialDebitOption = this.selectedDebitOption;
    this.initialCreditOption = this.selectedCreditOption;

    this.costsService.updateCostConfig(this.config).subscribe({
        next: () => {
        this.isLoading = false;
        },
        error: (err) => {
        console.error('Error al actualizar', err);
        this.isLoading = false;
        }
    });
    }
}

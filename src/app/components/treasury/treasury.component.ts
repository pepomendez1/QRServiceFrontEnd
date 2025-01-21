import { Component, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { TreasuryService } from 'src/app/services/treasury.service';
import { formatAsCurrency } from './transfer/utils';

@Component({
  selector: 'app-treasury',
  templateUrl: './treasury.component.html',
  styleUrls: ['./treasury.component.scss'],
})
export class TreasuryComponent implements OnInit {
  // Variable que controla la sección actual (balance, transfer, account)
  actualSection = 'balance';
  copyMessage: string | null = null;
  copyMessageTimeout: any;
  availableAmount: number = 0.0;
  visibleBalance: string = '0.00';
  accountInfo: any = {
    cvu: '',
    alias: '',
  };

  constructor(
    private treasuryService: TreasuryService,
    private clipboard: Clipboard
  ) {}
  ngOnInit(): void {
    this.treasuryService.getBalance().subscribe((data: any) => {
      this.availableAmount = data.balance;
      this.visibleBalance = formatAsCurrency(
        this.availableAmount.toString().replace('.', ',')
      );
      this.accountInfo = data?.accounts[0];
    });

    /*
    this.treasuryService.getAccountInfo().subscribe((data: any) => {
      this.accountInfo = data;
    });

     */
  }

  showSection(section: string) {
    this.actualSection = section;
    this.copyMessage = null;
    if (this.copyMessageTimeout) {
      clearTimeout(this.copyMessageTimeout);
    }
  }

  copyToClipboard(field: string) {
    let text: string;

    if (field === 'CVU') {
      text = this.accountInfo.cvu;
    } else if (field === 'Alias') {
      text = this.accountInfo.alias;
    } else if (field === '') {
      text = `nombre y apellido\n${this.accountInfo.cvu}\n${this.accountInfo.alias}`;
    } else {
      return; // Si el campo no es válido, salir de la función
    }

    this.clipboard.copy(text);
    this.copyMessage = `${field || 'Información completa'} en el portapapeles`;

    if (this.copyMessageTimeout) {
      clearTimeout(this.copyMessageTimeout);
    }

    this.copyMessageTimeout = setTimeout(() => {
      this.copyMessage = null;
    }, 3000);
  }

  isMobile(): boolean {
    return window.innerWidth <= 600;
  }
}

import { Component } from '@angular/core';
import { VoucherService } from 'src/app/services/layout/voucher.service';

@Component({
  selector: 'voucher',
  templateUrl: './voucher.component.html',
  standalone: true,
})
export class VoucherComponent {
  constructor(private voucherService: VoucherService) {}

  // generateVoucher(): void {
  //   this.voucherService.generateVoucher();
  // }
}

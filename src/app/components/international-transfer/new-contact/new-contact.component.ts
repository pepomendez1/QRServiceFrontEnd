import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { InternationalAccountService } from "src/app/services/international-account.service";

@Component({
  selector: 'app-transfer-amount',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './new-contact.component.html',
  styleUrl: './new-contact.component.scss',
})

export class NewContactTransferComponent implements OnInit  {
  constructor(
    private internationalService: InternationalAccountService,
  ) {}
  ngOnInit(): void {
  }
}

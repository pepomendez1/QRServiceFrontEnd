import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  investedReturn: number = 1000;
  investedReturnPercentage: number = 84;
  constructor() {}

  ngOnInit(): void {}
}

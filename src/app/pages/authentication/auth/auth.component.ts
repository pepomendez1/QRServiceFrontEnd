import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  isLoading: boolean = true; // Loading flag

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      if (code) {
        console.log('código presente en auth? ', code);
        this.router.navigate(['/auth/register'], {
          queryParams: { code: code },
        });
      }

      // Set isLoading to false regardless of route decision
      this.isLoading = false;
    });
  }
}

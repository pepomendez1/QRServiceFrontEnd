import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  isLoading: boolean = true; // Loading flag
  private loaderTimeout: any; // Timeout reference

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    console.log('AuthComponent initialized -------------------<');

    // Set a timeout to stop the loader after 2 seconds
    this.loaderTimeout = setTimeout(() => {
      console.log('Loader timeout reached, stopping loader');
      this.isLoading = false;
    }, 2000); // 2 seconds

    // Check for magic link on initial load
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      if (code) {
        console.log('Magic link detected, redirecting to /auth/register');
        this.router.navigate(['/auth/register'], {
          queryParams: { code: code },
        });
      } else {
        console.log('No magic link, stopping loader');
        this.isLoading = false; // Stop loader immediately
      }
    });
  }

  ngOnDestroy(): void {
    // Clear the timeout when the component is destroyed
    clearTimeout(this.loaderTimeout);
  }
}

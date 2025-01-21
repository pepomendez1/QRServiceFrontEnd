import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
// import function to register Swiper custom elements
import { register } from 'swiper/element/bundle';
// register Swiper custom elements
register();

@Component({
  selector: 'swiper-slide-custom',
  templateUrl: './swiper-slide.component.html',
  styleUrls: ['./swiper-slide.component.scss'],
})
export class SwiperSlideComponent implements OnInit {
  @Input() companyLogo: string | undefined; // or the appropriate type
  @Input() imageSource: string | undefined; // or the appropriate type
  @Input() slideTitle: string | undefined; // or the appropriate type
  @Input() slideMessage: string | undefined; // or the appropriate type

  constructor() {}

  ngOnInit(): void {
    // console.log('company logo: ', this.companyLogo);
    // console.log('image: ', this.imageSource);
    // console.log('title: ', this.slideTitle);
    // console.log('text: ', this.slideMessage);
  }
}

import { Directive, ElementRef, EventEmitter, Output } from '@angular/core';

@Directive({
  selector: '[appValidation]',
})
export class VerificationDirective {
  @Output() finished = new EventEmitter<void>(); // Emit an event when finished
  constructor(private elRef: ElementRef) {}

  ngOnInit() {
    this.elRef.nativeElement.addEventListener(
      'metamap:loaded',
      this.onLoaded.bind(this)
    );
    this.elRef.nativeElement.addEventListener(
      'metamap:userStartedSdk',
      this.onStarted.bind(this)
    );
    this.elRef.nativeElement.addEventListener(
      'metamap:userFinishedSdk',
      this.onFinished.bind(this)
    );
    this.elRef.nativeElement.addEventListener(
      'metamap:exitedSdk',
      this.onExited.bind(this)
    );
  }

  ngOnDestroy() {
    this.elRef.nativeElement.removeEventListener(
      'metamap:loaded',
      this.onLoaded.bind(this)
    );
    this.elRef.nativeElement.removeEventListener(
      'metamap:userStartedSdk',
      this.onStarted.bind(this)
    );
    this.elRef.nativeElement.removeEventListener(
      'metamap:userFinishedSdk',
      this.onFinished.bind(this)
    );
    this.elRef.nativeElement.removeEventListener(
      'metamap:exitedSdk',
      this.onExited.bind(this)
    );
  }

  onLoaded({ detail }: any) {
    console.log('[METAMAP] Loaded', detail);
  }

  onStarted({ detail }: any) {
    console.log('[METAMAP] User started verification', detail);
  }

  onFinished({ detail }: any) {
    console.log('[METAMAP] User finished verification', detail);
    this.finished.emit(); // Emit finished event to the component
  }

  onExited({ detail }: any) {
    console.log('[METAMAP] User exited verification', detail);
  }
}

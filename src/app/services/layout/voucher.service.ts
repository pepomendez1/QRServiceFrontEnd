import { Injectable } from '@angular/core';
import { TreasuryService } from '../treasury.service';
import { FormatNamePipe } from '../../pipes/format-name.pipe';
import { OnboardingService } from '../onboarding.service';
import { forkJoin, BehaviorSubject } from 'rxjs';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { DatePipe } from '@angular/common';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { SafeHtml } from '@angular/platform-browser';
import { StoreDataService } from '../store-data.service';
import { SvgLibraryService } from '../svg-library.service';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root',
})
export class VoucherService {
  private generatingVoucher = new BehaviorSubject<boolean>(false); // Tracks generation state
  public generatingVoucher$ = this.generatingVoucher.asObservable(); // Expose as observable
  //logoUrl: SafeHtml | null = null;
  logoUrl: any;
  primaryColor: string = '#F50050';
  constructor(
    private storeDataService: StoreDataService,
    private svgLibrary: SvgLibraryService,
    private onboardingService: OnboardingService,
    private treasuryService: TreasuryService,
    private datePipe: DatePipe,
    private formatNamePipe: FormatNamePipe
  ) {
    //this.logoUrl = this.svgLibrary.getLogo();
    storeDataService.getStore().subscribe({
      next: (store) => {
        this.primaryColor = store.init_config?.primary_color || '#F50050';
        this.logoUrl = store.init_config?.primary_logo_url;
      },
      error: (err) => {
        console.error('Error fetching parameters:', err);
      },
    });
  }

  setGeneratingState(isGenerating: boolean): void {
    this.generatingVoucher.next(isGenerating); // Update the state
  }

  private formatDate(date: string): string {
    // Use DatePipe to format the date
    const formattedDate =
      this.datePipe.transform(date, "EEEE, dd/MM/yyyy - HH:mm 'hs'") || '';

    // Capitalize the first letter
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }

  private toUpperCase(text: string): string {
    if (!text) return ''; // Handle empty or undefined input
    text = text.toLowerCase(); // Convert the entire string to lowercase first
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  private formatName(name: string): string {
    // Use the FormatNamePipe to format the name
    return this.formatNamePipe.transform(name);
  }

  private formatAmount(amount: number): string {
    // Format amount with two decimals and comma as decimal separator
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(
      amount
    );
  }

  // amount: 50
  // contact_name: "Stark, Tony"
  // created_at: "2024-11-20T11:50:54.259Z"
  // description: "Movimiento de Cuenta"
  // destination: "3220004782023055910025"
  // entity_name: "BANCO INDUSTRIAL S.A."
  // id: 213
  // source: "others"
  // source_id: null
  // status: "processed"
  // transaction_reference: "aaJ6jWeB1M"
  // type: "cash_out"
  // updated_at: "2024-11-20T11:50:57.258Z"

  generateVoucherById(transactionId: string): void {
    this.setGeneratingState(true); // Notify that generation has started

    const onboardingName$ = this.onboardingService.getOnboardingName(); // Observable for onboarding name
    const accountInfo$ = this.treasuryService.getBalance(); // Observable for account info
    const transactionDetail$ =
      this.treasuryService.getTransactionsDetailById(transactionId); // Observable for transaction details

    // Use forkJoin to fetch all required data in parallel
    forkJoin({
      onboardingName: onboardingName$,
      accountInfo: accountInfo$,
      transactionDetail: transactionDetail$,
    }).subscribe({
      next: (results: any) => {
        // Extract results from all API calls
        const onboardingName = results.onboardingName;
        const accountInfo = results.accountInfo?.accounts[0] || {};
        const transactionDetail = results.transactionDetail;

        console.log('Onboarding Name:', onboardingName);
        console.log('Account Info:', accountInfo);
        console.log('Transaction Detail:', transactionDetail);

        // Construct transaction data
        const transactionData = {
          date: this.formatDate(transactionDetail.created_at), // Formatted date
          amount: this.formatAmount(transactionDetail.amount), // Formatted amount
          reason: transactionDetail.description,
          type: this.getType(transactionDetail.type),
          senderName: `${onboardingName.first_name} ${this.toUpperCase(
            onboardingName.last_name
          )}`, // Sender name from onboarding
          senderCuit: `${onboardingName.tax_id}`, // Sender tax ID
          senderCvu: accountInfo.cvu || 'N/A', // Sender CVU from account info
          recipientName: this.formatName(transactionDetail.contact_name), // Recipient name
          recipientBank: transactionDetail.entity_name, // Recipient bank
          recipientCvu: transactionDetail.destination, // Recipient CVU
          recipientTaxId: transactionDetail.tax_id || '', // Recipient CVU
          operationNumber: transactionDetail.id, // Operation number
          identificationCode: transactionDetail.transaction_reference, // Transaction reference
        };

        // Generate the voucher
        this.generateVoucher(transactionData);
        this.setGeneratingState(false); // Notify that generation has finished
      },
      error: (err) => {
        console.error('Error fetching data for voucher generation:', err);
        this.setGeneratingState(false); // Notify that generation has finished
      },
    });
  }
  private getBase64FromSvgUrl(svgUrl: any): Promise<string> {
    return new Promise((resolve, reject) => {
      // Fetch the SVG content from the URL
      fetch(svgUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch SVG: ${response.statusText}`);
          }
          return response.text(); // Get the SVG as text
        })
        .then((svgContent) => {
          // Create an SVG Blob
          const blob = new Blob([svgContent], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);

          const img = new Image();
          img.onload = () => {
            // Draw the SVG image onto a canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const base64 = canvas.toDataURL('image/png'); // Convert to Base64 PNG
              resolve(base64);
            } else {
              reject(new Error('Could not get canvas context'));
            }
            URL.revokeObjectURL(url); // Clean up object URL
          };
          img.onerror = () => reject(new Error('Failed to load SVG as image'));
          img.src = url; // Set the image source to the created object URL
        })
        .catch((error) => reject(error));
    });
  }

  generateVoucher(transactionData: any): void {
    this.getBase64FromSvgUrl(this.logoUrl)
      .then((logoBase64) => {
        const docDefinition: any = {
          pageSize: {
            width: 400,
            height: 580,
          },
          pageMargins: [30, 30, 30, 30],
          content: [
            {
              stack: [
                {
                  image: logoBase64, // Include the fetched logo
                  fit: [100, 50], // Adjust size
                  alignment: 'left',
                  margin: [0, 0, 0, 20],
                },
                {
                  text: `${transactionData.type}`,
                  style: 'heading5',
                  margin: [0, 0, 0, 4],
                },
                {
                  text: `$ ${transactionData.amount}`,
                  style: 'amount',
                  margin: [0, 0, 0, 4],
                },
                {
                  text: transactionData.date,
                  style: 'date500',
                },
              ],
              margin: [0, 0, 0, 20],
            },

            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 300,
                  y2: 0,
                  lineWidth: 0.5,
                  lineColor: '#C2C2C2',
                }, // Color gris
              ],
              margin: [0, 0, 0, 15],
            },

            {
              columns: [
                {
                  // Left column: Canvas for red circles and vertical line
                  canvas: [
                    {
                      type: 'ellipse',
                      x: 5,
                      y: 5,
                      color: this.primaryColor,
                      r1: 4,
                      r2: 4,
                    }, // Top circle
                    {
                      type: 'line',
                      x1: 5,
                      y1: 10,
                      x2: 5,
                      y2: 110,
                      lineWidth: 1,
                      lineColor: '#C2C2C2',
                    }, // Vertical line
                    {
                      type: 'ellipse',
                      x: 5,
                      y: 115,
                      color: this.primaryColor,
                      r1: 4,
                      r2: 4,
                    }, // Bottom circle
                  ],
                  width: 20,
                },
                {
                  // Right column: Text details with spacing between rows
                  stack: [
                    // First stack for "From" section
                    {
                      stack: [
                        {
                          text: 'De',
                          style: 'details',
                          margin: [0, 0, 0, 3],
                        },
                        {
                          text: `${transactionData.senderName}`,
                          style: 'nameText',
                          margin: [0, 0, 0, 3],
                        },
                        {
                          text: `CUIT/CUIL: ${transactionData.senderCuit} `,
                          style: 'details',
                          margin: [0, 0, 0, 3],
                        },
                        {
                          text: `CVU: ${transactionData.senderCvu}`,
                          style: 'details',
                        },
                      ],
                      margin: [0, 0, 0, 47], // Spacing between "De" and "Para"
                    },

                    // Second stack for "To" section
                    {
                      stack: [
                        {
                          text: 'Para',
                          style: 'details',
                          margin: [0, 0, 0, 3],
                        },
                        {
                          text: `${transactionData.recipientName}`,
                          style: 'nameText',
                          margin: [0, 0, 0, 3],
                        },
                        {
                          text: `CUIT/CUIL: ${transactionData.recipientTaxId}`,
                          style: 'details',
                          margin: [0, 0, 0, 3],
                        },
                        {
                          text: `${transactionData.recipientBank}`,
                          style: 'details',
                          margin: [0, 0, 0, 3],
                        },
                        {
                          text: `CVU: ${transactionData.recipientCvu}`,
                          style: 'details',
                        },
                      ],
                    },
                  ],
                  margin: [3, 0, 0, 0], // Margin for the overall stack (space between canvas and text)
                  alignment: 'left', // Align text closer to the canvas
                },
              ],
              margin: [0, 0, 0, 20],
            },
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 300,
                  y2: 0,
                  lineWidth: 1,
                  lineColor: '#C2C2C2',
                }, // Color gris
              ],
              margin: [0, 0, 0, 15],
            },
            {
              text: 'Numero de operación',
              style: 'details',
              margin: [0, 0, 0, 2],
            },
            {
              text: `#${transactionData.operationNumber}`,
              style: 'detailsBold',
              margin: [0, 0, 0, 10],
            },
            {
              text: 'código de identificación',
              style: 'details',
              margin: [0, 0, 0, 2],
            },
            {
              text: `${transactionData.identificationCode}`,
              style: 'detailsBold',
              margin: [0, 0, 0, 10],
            },
            {
              text: 'Motivo',
              style: 'details',
              margin: [0, 0, 0, 2],
            },
            {
              text: `${transactionData.reason}`,
              style: 'detailsBold',
            },
            // Other content remains unchanged
          ],
          styles: {
            heading5: {
              font: 'Roboto',
              fontSize: 15,
              bold: true,
              lineHeight: 1,
              alignment: 'left',
            },

            amount: {
              color: '#161616', // Red text
              font: 'Roboto',
              fontSize: 21,
              bold: true,
              lineHeight: 1,
              alignment: 'left',
            },
            date500: {
              font: 'Roboto',
              color: '#4D4D4D',
              fontSize: 10.5,
              bold: false,
              lineHeight: 1,
              alignment: 'left',
            },
            details: {
              font: 'Roboto',
              color: '#4D4D4D',
              fontSize: 10.5,
              bold: false,
              lineHeight: 1,
              alignment: 'left',
            },
            detailsBold: {
              font: 'Roboto',
              color: '#4D4D4D',
              fontSize: 10.5,
              bold: true,
              lineHeight: 1,
              alignment: 'left',
            },
            nameText: {
              font: 'Roboto',
              color: '#000000',
              fontSize: 15,
              bold: true,
              lineHeight: 1,
              alignment: 'left',
            },
          },
        };

        pdfMake
          .createPdf(docDefinition)
          .download('comprobante_transaccion.pdf');
      })
      .catch((error) => {
        console.error('Error loading logo:', error);
      });
  }

  getType(type: string) {
    switch (type) {
      case 'cash_out':
        return 'Transferencia enviada';
      case 'cash_in':
        return 'Transferencia recibida';
      default:
        return 'Operación realizada';
    }
  }
}

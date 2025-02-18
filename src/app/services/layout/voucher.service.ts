import { Injectable } from '@angular/core';
import { TreasuryService } from '../treasury.service';
import { FormatNamePipe } from '../../pipes/format-name.pipe';
import { OnboardingService } from '../onboarding.service';
import { forkJoin, BehaviorSubject } from 'rxjs';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { DatePipe } from '@angular/common';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DescriptionTable } from 'src/app/components/treasury-activity/treasury-activity-utils/description-table';
import { StoreDataService } from '../store-data.service';
import { SvgLibraryService } from '../svg-library.service';
import { ThemeService } from './theme-service';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root',
})
export class VoucherService {
  private generatingVoucher = new BehaviorSubject<boolean>(false); // Tracks generation state
  public generatingVoucher$ = this.generatingVoucher.asObservable(); // Expose as observable
  logoUrl: SafeHtml | null = null;
  //logoUrl: any;
  primaryColor: string = '#F50050';
  constructor(
    private sanitizer: DomSanitizer,
    private descriptionTable: DescriptionTable,
    private storeDataService: StoreDataService,
    private svgLibrary: SvgLibraryService,
    private onboardingService: OnboardingService,
    private treasuryService: TreasuryService,
    private datePipe: DatePipe,
    private formatNamePipe: FormatNamePipe
  ) {
    //this.logoUrl = this.svgLibrary.getLogo();
    this.initLogoAndColor();
  }

  private initLogoAndColor(): void {
    this.storeDataService.getStore().subscribe({
      next: (store) => {
        const isDarkMode = false; // Replace with actual dark mode check if available
        this.primaryColor = store.init_config?.primary_color || '#4876DB';
        this.logoUrl = this.svgLibrary.getLogo(); // Pass primary color to svgLibrary
      },
      error: (err) => {
        console.error('Error fetching store data:', err);
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
          description:
            transactionDetail.description ||
            this.descriptionTable.getDescription(
              transactionDetail.type,
              transactionDetail.source
            ),
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
          destinationMessage: this.getDestinationMessage(
            transactionDetail.source
          ),
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
  private getBase64FromSafeSvg(safeSvg: SafeHtml): Promise<string> {
    // Bypass security to get the raw SVG content
    const rawSvg = this.sanitizer.sanitize(1, safeSvg) as string;

    if (!rawSvg) {
      return Promise.reject('Failed to extract raw SVG content');
    }

    const blob = new Blob([rawSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Failed to create canvas context');
          }

          ctx.drawImage(img, 0, 0);
          const base64 = canvas.toDataURL('image/png');
          resolve(base64);
        } catch (error) {
          reject(error);
        } finally {
          URL.revokeObjectURL(url);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG as image'));
      };

      img.src = url;
    });
  }

  generateVoucher(transactionData: any): void {
    this.getBase64FromSafeSvg(this.logoUrl as SafeHtml) // Handle SafeHtml
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
                  text: `${transactionData.description}`,
                  style: 'heading5',
                  margin: [0, 0, 0, 4],
                },
                {
                  text: `$ ${transactionData.amount}`,
                  style: 'amount',
                  margin: [0, 0, 0, 4],
                },
                {
                  text: transactionData.date || 'Fecha no disponible',
                  style: 'date500',
                },
              ],
              margin: [0, 0, 0, 20],
            },

            // Horizontal line
            ...(transactionData.type
              ? [
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
                      },
                    ],
                    margin: [0, 0, 0, 15],
                  },
                ]
              : []),

            // Sender and recipient details
            {
              columns: [
                {
                  // Left column: Circle and line
                  canvas: [
                    {
                      type: 'ellipse',
                      x: 5,
                      y: 5,
                      color: this.primaryColor,
                      r1: 4,
                      r2: 4,
                    },
                    ...(transactionData.recipientName ||
                    transactionData.recipientTaxId ||
                    transactionData.recipientCvu
                      ? [
                          {
                            type: 'line',
                            x1: 5,
                            y1: 10,
                            x2: 5,
                            y2: 110,
                            lineWidth: 1,
                            lineColor: '#C2C2C2',
                          },
                          {
                            type: 'ellipse',
                            x: 5,
                            y: 115,
                            color: this.primaryColor,
                            r1: 4,
                            r2: 4,
                          },
                        ]
                      : []),
                  ],
                  width: 20,
                },
                {
                  // Right column: Sender and recipient details
                  stack: [
                    // Sender information
                    ...(transactionData.senderName ||
                    transactionData.senderCuit ||
                    transactionData.senderCvu
                      ? [
                          {
                            text: transactionData.destinationMessage,
                            style: 'details',
                            margin: [0, 0, 0, 3],
                          },
                          ...(transactionData.senderName
                            ? [
                                {
                                  text: transactionData.senderName,
                                  style: 'nameText',
                                  margin: [0, 0, 0, 3],
                                },
                              ]
                            : []),
                          ...(transactionData.senderCuit
                            ? [
                                {
                                  text: `CUIT/CUIL: ${transactionData.senderCuit}`,
                                  style: 'details',
                                  margin: [0, 0, 0, 3],
                                },
                              ]
                            : []),
                          ...(transactionData.senderCvu
                            ? [
                                {
                                  text: `CVU: ${transactionData.senderCvu}`,
                                  style: 'details',
                                },
                              ]
                            : []),
                          // Add spacing if "Para" (recipient) exists
                          ...(transactionData.recipientName ||
                          transactionData.recipientTaxId ||
                          transactionData.recipientCvu
                            ? [
                                {
                                  text: '', // Empty text to create spacing
                                  margin: [0, 0, 0, 47],
                                },
                              ]
                            : []),
                        ]
                      : []),
                    // Recipient information
                    ...(transactionData.recipientName ||
                    transactionData.recipientTaxId ||
                    transactionData.recipientCvu
                      ? [
                          {
                            text: 'Para',
                            style: 'details',
                            margin: [0, 0, 0, 3],
                          },
                          ...(transactionData.recipientName
                            ? [
                                {
                                  text: transactionData.recipientName,
                                  style: 'nameText',
                                  margin: [0, 0, 0, 3],
                                },
                              ]
                            : []),
                          ...(transactionData.recipientTaxId
                            ? [
                                {
                                  text: `CUIT/CUIL: ${transactionData.recipientTaxId}`,
                                  style: 'details',
                                  margin: [0, 0, 0, 3],
                                },
                              ]
                            : []),
                          ...(transactionData.recipientBank
                            ? [
                                {
                                  text: transactionData.recipientBank,
                                  style: 'details',
                                  margin: [0, 0, 0, 3],
                                },
                              ]
                            : []),
                          ...(transactionData.recipientCvu
                            ? [
                                {
                                  text: `CVU: ${transactionData.recipientCvu}`,
                                  style: 'details',
                                },
                              ]
                            : []),
                        ]
                      : []),
                  ],
                  margin: [3, 0, 0, 0],
                  alignment: 'left',
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
            // Operation number
            {
              text: 'Número de operación',
              style: 'details',
              margin: [0, 0, 0, 2],
            },
            {
              text: `#${transactionData.operationNumber || 'No disponible'}`,
              style: 'detailsBold',
              margin: [0, 0, 0, 10],
            },

            // Transaction reason
            ...(transactionData.reason
              ? [
                  {
                    text: 'Motivo',
                    style: 'details',
                    margin: [0, 0, 0, 2],
                  },
                  {
                    text: transactionData.reason || 'No especificado',
                    style: 'detailsBold',
                    margin: [0, 0, 0, 10],
                  },
                ]
              : []),
            // Transaction reference
            ...(transactionData.identificationCode
              ? [
                  {
                    text: 'Código de identificación',
                    style: 'details',
                    margin: [0, 0, 0, 2],
                  },
                  {
                    text: `${transactionData.identificationCode}`,
                    style: 'detailsBold',
                    margin: [0, 0, 0, 10],
                  },
                ]
              : []),
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
              color: '#161616',
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

  getDestinationMessage(source: string) {
    switch (source) {
      case 'balance-investments':
      case 'balance-investment':
        return 'Destino';
      default:
        return 'De'; // Default case if no match is found
    }
  }
}

export interface CostCommissionOption {
  id: number;
  name: string;
  commission: number;
  active: boolean;
  accreditation_delay: number;
}

export interface TransactionalCommission {
  credit_card: { options: CostCommissionOption[] };
  debit_card: { options: CostCommissionOption[] };
  prepaid_card: { options: CostCommissionOption[] };
  bank_transfer: { options: CostCommissionOption[] };
  smart_transfers: { options: CostCommissionOption[] };
}

export interface FinancialCommissionOption {
  id: number;
  installments: number;
  factor: number;
  active: boolean;
}

export interface FinancialCommission {
  with_interest: FinancialCommissionOption[];
  without_interest: FinancialCommissionOption[];
}

export interface CostConfig {
  iva: number;
  cfta: number;
  transactional_commission: TransactionalCommission;
  financial_commission: FinancialCommission;
}

export const CostConfigMockData = {
  "iva": 21,
  "cfta": 200,
  "transactional_commission": {
    "credit_card": {
      "options": [
        {"id": 1, "name": "Acreditación inmediata", "commission": 5.49, "active": true, "accreditation_delay": 0},
        {"id": 2, "name": "Acreditación en 3 días", "commission": 4.99, "active": false, "accreditation_delay": 72},
        {"id": 3, "name": "Acreditación en 10 días", "commission": 4.29, "active": false, "accreditation_delay": 240},
        {"id": 4, "name": "Acreditación en 20 días", "commission": 3.29, "active": false, "accreditation_delay": 480},
        {"id": 5, "name": "Acreditación en 30 días", "commission": 2.29, "active": false, "accreditation_delay": 720}
      ]
    },
    "debit_card": {
      "options": [
        {"id": 1, "name": "Acreditación inmediata", "commission": 2.79, "active": true, "accreditation_delay": 0},
        {"id": 2, "name": "Acreditación en 1 día", "commission": 2.49, "active": false, "accreditation_delay": 24}
      ]
    },
    "prepaid_card": {
      "options": [
        {"id": 1, "name": "Acreditación inmediata", "commission": 2.99, "active": true, "accreditation_delay": 0},
        {"id": 2, "name": "Acreditación en 2 días", "commission": 2.79, "active": false, "accreditation_delay": 48}
      ]
    },
    "bank_transfer": {
      "options": [
        {"id": 1, "name": "Acreditación inmediata", "commission": 0.80, "active": true, "accreditation_delay": 0}
      ]
    },
    "smart_transfers": {
      "options": [
        {"id": 1, "name": "Acreditación inmediata", "commission": 1.0, "active": true, "accreditation_delay": 0}
      ]
    }
  },
  "financial_commission": {
    "with_interest": [
      {"id": 2, "installments": 2, "factor": 1.1052, "active": true},
      {"id": 3, "installments": 3, "factor": 1.1382, "active": true},
      {"id": 4, "installments": 4, "factor": 1.1719, "active": true},
      {"id": 5, "installments": 5, "factor": 1.2061, "active": false},
      {"id": 6, "installments": 6, "factor": 1.2411, "active": true},
      {"id": 7, "installments": 7, "factor": 1.2766, "active": false},
      {"id": 8, "installments": 8, "factor": 1.3128, "active": false},
      {"id": 9, "installments": 9, "factor": 1.3497, "active": true},
      {"id": 10, "installments": 10, "factor": 1.3871, "active": false},
      {"id": 11, "installments": 11, "factor": 1.4252, "active": false},
      {"id": 12, "installments": 12, "factor": 1.4639, "active": true}
    ],
    "without_interest": [
      {"id": 112, "installments": 2, "factor": 10.52, "active": false},
      {"id": 113, "installments": 3, "factor": 13.82, "active": false},
      {"id": 114, "installments": 4, "factor": 17.19, "active": false},
      {"id": 115, "installments": 5, "factor": 20.61, "active": false},
      {"id": 116, "installments": 6, "factor": 24.11, "active": false},
      {"id": 117, "installments": 7, "factor": 27.66, "active": false},
      {"id": 118, "installments": 8, "factor": 31.28, "active": false},
      {"id": 119, "installments": 9, "factor": 34.97, "active": false},
      {"id": 120, "installments": 10, "factor": 38.71, "active": false},
      {"id": 121, "installments": 11, "factor": 42.52, "active": false},
      {"id": 122, "installments": 12, "factor": 46.39, "active": false}
    ]
  }
}

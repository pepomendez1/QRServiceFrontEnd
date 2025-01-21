// MS Onboarding
export const ONBOARDING_STEPS = {
  START: 'kyc_kyb_pending', //kyc
  KYC_CONTINUE: 'kyc_pending_continue', //solo front
  AFIP_CONTINUE: 'cuil_pending_continue', //
  //KYC: 'kyc_kyb_pending', // kyc_kyb_pending
  ADDRESS: 'address_pending', //address_pending
  AFFIDAVIT: 'affidavit_terms_pend', //affidavit_pending
  TERMS: 'terms_pending', //terms_pending
  COMPLETED: 'onboarding_completed',
  //PIN: 'pin-code', // no está en onboading service (user)
};

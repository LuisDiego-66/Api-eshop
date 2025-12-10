export interface BNBPayload {
  QRId: string;
  Gloss: string;
  sourceBankId: number;
  originName: string;
  VoucherId: string;
  TransactionDateTime: string;
  additionalData: string;
  amount: number;
  currencyId: number;
}

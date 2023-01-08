export interface INewTransactionDetail {
  transaction_id: string;
  transaction_time: Date;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  tier: string;
  remark: string;
  total_trx: number;
  partner_id: string;
  partner_api_key: string;
  partner_name: string;
  quantity: number;
  act_trx: number;
  promo_code: string;
  prosentase: number;
  point_transaction: number;
  point_loyalty: number;
  point_total: number;
}

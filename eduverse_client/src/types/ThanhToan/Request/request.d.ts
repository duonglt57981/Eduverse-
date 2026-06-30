export interface WebhookRequest {
  orderCode: string;
  status: string;
  data?: any;
  signature?: string;
}

export interface TaoThanhToanRequest {
  khoaHocIds: string[];
  maGiamGia?: string;
}

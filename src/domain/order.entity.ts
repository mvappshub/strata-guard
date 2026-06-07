export interface OrderItem {
  sku: string;
  priceCents: number;
  qty: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'paid';
}

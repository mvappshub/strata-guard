import type { Money, Order, OrderItem } from '@/domain';

export function itemLineTotal(item: OrderItem): number {
  return item.priceCents * item.qty;
}

export function itemsSubtotalCents(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + itemLineTotal(item), 0);
}

export function orderTotal(order: Order): Money {
  return { amountCents: itemsSubtotalCents(order.items), currency: 'CZK' };
}

export function countOrderItems(order: Order): number {
  return order.items.length;
}

export function sumItemQuantities(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.qty, 0);
}

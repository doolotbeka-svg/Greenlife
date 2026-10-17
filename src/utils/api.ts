import { Order, SiteContent } from '../types/store';

const ADMIN_PASSWORD_KEY = 'greenleaf_admin_password';

export class ApiError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

async function request<T>(path: string, init: RequestInit = {}, password?: string): Promise<T> {
  const headers = new Headers(init.headers);
  if (password) headers.set('x-admin-password', password);
  const res = await fetch(`/api${path}`, { ...init, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body?.error || 'request_failed');
  return body as T;
}

// The password is kept for this browser tab only and sent with every admin request
export const adminSession = {
  get(): string {
    try {
      return sessionStorage.getItem(ADMIN_PASSWORD_KEY) || '';
    } catch {
      return '';
    }
  },
  set(password: string) {
    try {
      sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
    } catch {
      // Private mode: the admin will just have to log in again after reload
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
    } catch {
      // ignore
    }
  },
};

export async function fetchContent(): Promise<SiteContent | null> {
  const { content } = await request<{ content: SiteContent | null }>('/content');
  return content;
}

export async function saveContent(content: SiteContent, password: string): Promise<string> {
  const { updatedAt } = await request<{ updatedAt: string }>(
    '/content',
    { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content }) },
    password
  );
  return updatedAt;
}

export async function adminLogin(password: string): Promise<void> {
  await request('/admin/login', { method: 'POST' }, password);
}

export async function changeAdminPassword(newPassword: string, password: string): Promise<void> {
  await request(
    '/admin/password',
    { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ newPassword }) },
    password
  );
}

// Shrinks photos in the browser so uploads stay well under the 4 MB function limit
async function resizeImage(file: File, maxSide = 1600): Promise<Blob> {
  if (file.type === 'image/gif') return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('resize_failed'))), type, 0.85)
  );
}

export async function uploadImage(file: File, password: string): Promise<string> {
  const blob = await resizeImage(file);
  const { url } = await request<{ url: string }>(
    '/upload',
    { method: 'POST', headers: { 'content-type': blob.type }, body: blob },
    password
  );
  return url;
}

export async function submitOrder(order: Order): Promise<Order> {
  const res = await request<{ order: Order }>('/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ order }),
  });
  return res.order;
}

export async function fetchOrders(password: string): Promise<Order[]> {
  const { orders } = await request<{ orders: Order[] }>('/orders', {}, password);
  return orders;
}

export async function updateOrderStatus(id: string, status: Order['status'], password: string): Promise<void> {
  await request(
    `/orders/${encodeURIComponent(id)}`,
    { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) },
    password
  );
}

export async function deleteOrder(id: string, password: string): Promise<void> {
  await request(`/orders/${encodeURIComponent(id)}`, { method: 'DELETE' }, password);
}

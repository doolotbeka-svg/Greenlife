import crypto from 'crypto';
import { readJson, writeJson } from './storage.js';

// Finik (averspay.kg) acquiring API. Requests are signed with our RSA private key; Finik signs
// webhooks with its own key, which we verify with the public key Finik gives us.
const PROD_URL = 'https://api.acquiring.averspay.kg/v1/payment';
const BETA_URL = 'https://beta.api.acquiring.averspay.kg/v1/payment';
// A webhook older than this is rejected so a captured request cannot be replayed later
const WEBHOOK_MAX_AGE_MS = 5 * 60 * 1000;

function pem(value: string | undefined): string {
  return (value || '').replace(/\\n/g, '\n').trim();
}

export function finikConfig() {
  const env = process.env;
  return {
    apiUrl: env.FINIK_API_URL || (env.FINIK_ENV === 'beta' ? BETA_URL : PROD_URL),
    apiKey: env.FINIK_API_KEY || '',
    accountId: env.FINIK_ACCOUNT_ID || '',
    privateKey: pem(env.FINIK_PRIVATE_KEY),
    // Finik's key for checking webhook signatures
    publicKey: pem(env.FINIK_PUBLIC_KEY),
  };
}

// Our signing key: FINIK_PRIVATE_KEY if set, otherwise a key pair the server generated itself and
// keeps in private storage, so the private key never has to be copied anywhere by hand
const KEY_PATH = 'config/finik-key.json';
let cachedKey: string | null = null;

async function storedPrivateKey(create: boolean): Promise<string> {
  if (cachedKey) return cachedKey;
  const saved = await readJson<{ privateKey: string }>(KEY_PATH);
  if (saved?.privateKey) return (cachedKey = saved.privateKey);
  if (!create) return '';
  const { privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  await writeJson(KEY_PATH, { privateKey, createdAt: new Date().toISOString() });
  return (cachedKey = privateKey);
}

async function signingKey(create = false): Promise<string> {
  return finikConfig().privateKey || (await storedPrivateKey(create));
}

// Public half of our signing key, to send to Finik; generates the pair on first use
export async function finikShopPublicKey(): Promise<string> {
  const privateKey = await signingKey(true);
  return crypto.createPublicKey(privateKey).export({ type: 'spki', format: 'pem' }).toString();
}

export async function isFinikConfigured(): Promise<boolean> {
  const c = finikConfig();
  return !!(c.apiKey && c.accountId && c.publicKey && (await signingKey()));
}

// Same canonical string as Finik's own signer (@mancho.devs/authorizer)
export function canonicalString(
  method: string,
  path: string,
  headers: Record<string, string>,
  body: Record<string, unknown> | null,
  query: Record<string, string> = {}
): string {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) lower[k.toLowerCase()] = String(v);
  if (!lower.host) throw new Error('Host header is required for Finik signature');

  const headerPart = [
    `host:${lower.host}`,
    ...Object.keys(lower)
      .filter((k) => k.startsWith('x-api-'))
      .sort()
      .map((k) => `${k}:${lower[k]}`),
  ].join('&');

  const parts = [method.toLowerCase(), decodeURI(path || ''), headerPart];
  const queryPart = Object.keys(query)
    .sort()
    .map((k) => `${encodeURI(decodeURI(k))}=${encodeURI(decodeURI(query[k] ?? ''))}`)
    .join('&');
  if (queryPart) parts.push(queryPart);

  let bodyPart = '';
  if (body) {
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(body).sort((a, b) => a.localeCompare(b))) sorted[k] = body[k];
    bodyPart = JSON.stringify(sorted);
  }
  parts.push(bodyPart);
  return parts.join('\n');
}

export function signFinik(data: string, privateKey: string): string {
  return crypto.createSign('SHA256').update(data).sign(privateKey, 'base64');
}

export function verifyFinik(data: string, signature: string, publicKey: string): boolean {
  try {
    return crypto.createVerify('SHA256').update(data).verify(publicKey, signature, 'base64');
  } catch {
    return false;
  }
}

export interface CreatePaymentInput {
  paymentId: string;
  amount: number;
  description: string;
  displayName: string;
  redirectUrl: string;
  webhookUrl: string;
  lang: 'ru' | 'ky';
}

// Returns the Finik payment page URL for the shopper
export async function createFinikPayment(input: CreatePaymentInput): Promise<string> {
  const c = finikConfig();
  const privateKey = await signingKey();
  const url = new URL(c.apiUrl);
  const body = {
    Amount: Math.round(input.amount * 100) / 100,
    CardType: 'FINIK_QR',
    PaymentId: input.paymentId,
    RedirectUrl: input.redirectUrl,
    Data: {
      accountId: c.accountId,
      name_en: input.displayName,
      webhookUrl: input.webhookUrl,
      description: input.description,
      Lang: input.lang,
    },
  };
  const timestamp = Date.now().toString();
  const signature = signFinik(
    canonicalString('POST', url.pathname, { Host: url.host, 'x-api-key': c.apiKey, 'x-api-timestamp': timestamp }, body),
    privateKey
  );

  const res = await fetch(url, {
    method: 'POST',
    redirect: 'manual',
    signal: AbortSignal.timeout(15000),
    headers: {
      'content-type': 'application/json',
      'x-api-key': c.apiKey,
      'x-api-timestamp': timestamp,
      signature,
    },
    body: JSON.stringify(body),
  });

  let link: string | null = null;
  if (res.status >= 300 && res.status < 400) {
    link = res.headers.get('location');
  } else if (res.ok) {
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    link = (data.paymentUrl || data.payment_url || data.link || null) as string | null;
  } else {
    const text = await res.text().catch(() => '');
    throw new Error(`Finik responded ${res.status}: ${text.slice(0, 300)}`);
  }
  if (!link || !/^https:\/\//.test(link)) throw new Error('Finik did not return a payment link');
  return link;
}

export interface FinikWebhook {
  paymentId: string;
  transactionId: string;
  status: 'paid' | 'failed' | 'pending';
  amount: number | null;
}

// Verifies a webhook request and extracts what we need; returns null when it is not genuine
export function parseFinikWebhook(
  method: string,
  path: string,
  host: string,
  headers: Record<string, string | string[] | undefined>,
  body: unknown,
  query: Record<string, string>
): FinikWebhook | null {
  const { publicKey } = finikConfig();
  if (!publicKey || !body || typeof body !== 'object' || Array.isArray(body)) return null;

  const signature = String(headers['signature'] || '');
  const timestamp = Number(headers['x-api-timestamp']);
  if (!signature || !timestamp || Math.abs(Date.now() - timestamp) > WEBHOOK_MAX_AGE_MS) return null;

  const signed: Record<string, string> = { Host: host };
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase().startsWith('x-api-') && v !== undefined) signed[k.toLowerCase()] = Array.isArray(v) ? v[0] : v;
  }
  const data = canonicalString(method, path, signed, body as Record<string, unknown>, query);
  if (!verifyFinik(data, signature, publicKey)) return null;

  const p = body as Record<string, any>;
  const fields = (p.fields && typeof p.fields === 'object' ? p.fields : {}) as Record<string, any>;
  const paymentId = String(fields.paymentId || p.Data?.paymentId || p.PaymentId || p.payment_id || '').trim();
  const raw = String(p.status || '').toLowerCase();
  const status = ['succeeded', 'success'].includes(raw)
    ? 'paid'
    : ['failed', 'canceled', 'cancelled'].includes(raw)
    ? 'failed'
    : 'pending';
  const amountRaw = p.amount ?? p.Amount ?? fields.amount;
  const amount = amountRaw === undefined || amountRaw === null ? null : Number(amountRaw);
  return {
    paymentId,
    transactionId: String(p.transactionId || p.id || ''),
    status,
    amount: amount !== null && Number.isFinite(amount) ? amount : null,
  };
}

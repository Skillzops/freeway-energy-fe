type PaystackMetadata = Record<string, any>;

interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  reference: string;
  metadata?: PaystackMetadata;
  onSuccess: (response: { reference: string; [key: string]: any }) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: Record<string, any>) => { openIframe: () => void };
    };
  }
}

let paystackScriptLoader: Promise<void> | null = null;

const PAYSTACK_SCRIPT_URL = 'https://js.paystack.co/v1/inline.js';

export const loadPaystackScript = (): Promise<void> => {
  if (window.PaystackPop) {
    return Promise.resolve();
  }

  if (paystackScriptLoader) {
    return paystackScriptLoader;
  }

  paystackScriptLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = PAYSTACK_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Failed to load Paystack checkout script'));
    document.body.appendChild(script);
  });

  return paystackScriptLoader;
};

export const startPaystackPayment = async (options: PaystackOptions) => {
  await loadPaystackScript();

  if (!window.PaystackPop) {
    throw new Error('Paystack is unavailable on this browser');
  }

  const amountInKobo = Math.round(options.amount * 100);
  const handler = window.PaystackPop.setup({
    key: options.key,
    email: options.email,
    amount: amountInKobo,
    ref: options.reference,
    metadata: options.metadata,
    callback: options.onSuccess,
    onClose: options.onClose,
  });

  handler.openIframe();
};

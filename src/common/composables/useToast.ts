import { reactive } from 'vue';

export type ToastType = 'success' | 'danger' | 'info' | 'warning';

type ToastState = {
  show: boolean;
  message: string;
  type: ToastType;
  timeoutMs: number;
};

const state = reactive<ToastState>({
  show: false,
  message: '',
  type: 'info',
  timeoutMs: 2500,
});

let timer: number | null = null;

function showToast(message: string, type: ToastType = 'info', timeoutMs = 2500) {
  state.message = message;
  state.type = type;
  state.timeoutMs = timeoutMs;
  state.show = true;

  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    state.show = false;
  }, timeoutMs);
}

function hideToast() {
  state.show = false;
  if (timer) window.clearTimeout(timer);
  timer = null;
}

export function useToast() {
  return {
    state,
    showToast,
    hideToast,
    success: (msg: string, ms?: number) => showToast(msg, 'success', ms ?? 2500),
    error: (msg: string, ms?: number) => showToast(msg, 'danger', ms ?? 3000),
    info: (msg: string, ms?: number) => showToast(msg, 'info', ms ?? 2500),
    warning: (msg: string, ms?: number) => showToast(msg, 'warning', ms ?? 3000),
  };
}

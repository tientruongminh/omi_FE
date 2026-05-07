const TOKEN_BALANCE_EVENT = 'omilearn:token-balance-refresh';

export function requestTokenBalanceRefresh() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(TOKEN_BALANCE_EVENT));
}

export function onTokenBalanceRefresh(handler: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(TOKEN_BALANCE_EVENT, handler);
  return () => window.removeEventListener(TOKEN_BALANCE_EVENT, handler);
}

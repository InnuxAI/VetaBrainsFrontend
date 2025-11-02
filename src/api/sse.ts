import { fetchEventSource } from "@microsoft/fetch-event-source";

export async function postSSE<TBody extends object>(
  url: string,
  body: TBody,
  token: string | null,
  handlers: {
    onOpen?: () => void;
    onMessage?: (data: string, event?: string) => void;
    onError?: (e: any) => void;
    onClose?: () => void;
  }
) {
  await fetchEventSource(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    openWhenHidden: true,
    onopen() {
      handlers.onOpen?.();
    },
    onmessage(ev) {
      handlers.onMessage?.(ev.data ?? "", ev.event);
    },
    onerror(err) {
      handlers.onError?.(err);
      throw err;
    },
    onclose() {
      handlers.onClose?.();
    },
  });
}

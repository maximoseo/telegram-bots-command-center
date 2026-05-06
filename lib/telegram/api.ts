type TelegramApiResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

export type TelegramBotInfo = {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
};

async function telegramRequest<T>(token: string, method: string, body?: Record<string, unknown>) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store'
  });

  const data = (await response.json()) as TelegramApiResponse<T>;
  if (!response.ok || !data.ok || !data.result) {
    throw new Error(data.description || `Telegram ${method} failed`);
  }
  return data.result;
}

export function getTelegramBotInfo(token: string) {
  return telegramRequest<TelegramBotInfo>(token, 'getMe');
}

export function setTelegramWebhook(token: string, url: string, secretToken: string) {
  return telegramRequest<boolean>(token, 'setWebhook', {
    url,
    secret_token: secretToken,
    allowed_updates: ['message'],
    drop_pending_updates: false
  });
}

export function deleteTelegramWebhook(token: string) {
  return telegramRequest<boolean>(token, 'deleteWebhook', { drop_pending_updates: false });
}

export function sendTelegramMessage(token: string, chatId: number | string, text: string) {
  return telegramRequest<unknown>(token, 'sendMessage', {
    chat_id: chatId,
    text,
    disable_web_page_preview: true
  });
}

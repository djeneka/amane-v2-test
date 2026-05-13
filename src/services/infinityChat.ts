export type InfinityChatHistoryEntry = { role: 'user' | 'assistant'; content: string };

export function getInfinityChatBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_INFINITY_CHAT_API_URL ??
    'https://graveness-turkey-stained.ngrok-free.dev';
  return raw.replace(/\/$/, '');
}

export async function postInfinityChat(params: {
  baseUrl: string;
  message: string;
  sessionId: string;
  history: InfinityChatHistoryEntry[];
}): Promise<{ reply: string }> {
  const url = `${params.baseUrl}/api/chat`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (params.baseUrl.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: params.message,
      session_id: params.sessionId,
      history: params.history,
    }),
  });

  const data = (await res.json()) as { reply?: unknown };

  if (!res.ok || typeof data.reply !== 'string') {
    throw new Error('Chat request failed');
  }

  return { reply: data.reply };
}

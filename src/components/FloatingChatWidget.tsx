'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  getInfinityChatBaseUrl,
  postInfinityChat,
  type InfinityChatHistoryEntry,
} from '@/services/infinityChat';

type ChatRole = 'assistant' | 'user';

type ChatPhase = 'waiting_choice' | 'whatsapp' | 'virtual_assistant';

const WHATSAPP_AGENT_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_AGENT_URL ?? 'https://wa.me/2250720000006';

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  whatsappHref?: string;
  whatsappLinkLabel?: string;
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function newSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export default function FloatingChatWidget() {
  const t = useTranslations('floatingChat');
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<ChatPhase>('waiting_choice');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: newId(), role: 'assistant', text: t('welcome') },
    { id: newId(), role: 'assistant', text: t('choiceAction1') },
    { id: newId(), role: 'assistant', text: t('choiceAction2') },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const apiHistoryRef = useRef<InfinityChatHistoryEntry[]>([]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, isSending]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    setInput('');

    const userMsg: ChatMessage = { id: newId(), role: 'user', text: trimmed };
    const normalized = trimmed.replace(/\s/g, '');

    if (phase === 'waiting_choice') {
      if (normalized === '1') {
        setPhase('whatsapp');
        setMessages((prev) => [
          ...prev,
          userMsg,
          {
            id: newId(),
            role: 'assistant',
            text: t('whatsappIntro'),
            whatsappHref: WHATSAPP_AGENT_URL,
            whatsappLinkLabel: t('whatsappOpenLink'),
          },
        ]);
        return;
      }
      if (normalized === '2') {
        sessionIdRef.current = newSessionId();
        apiHistoryRef.current = [];
        setPhase('virtual_assistant');
        setMessages((prev) => [
          ...prev,
          userMsg,
          { id: newId(), role: 'assistant', text: t('virtualFollowUp') },
        ]);
        return;
      }
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: newId(), role: 'assistant', text: t('invalidChoice') },
      ]);
      return;
    }

    if (phase === 'virtual_assistant') {
      if (!sessionIdRef.current) {
        sessionIdRef.current = newSessionId();
      }

      void (async () => {
        const baseUrl = getInfinityChatBaseUrl();
        setMessages((prev) => [...prev, userMsg]);
        setIsSending(true);
        try {
          const { reply } = await postInfinityChat({
            baseUrl,
            message: trimmed,
            sessionId: sessionIdRef.current!,
            history: [...apiHistoryRef.current],
          });
          apiHistoryRef.current = [
            ...apiHistoryRef.current,
            { role: 'user' as const, content: trimmed },
            { role: 'assistant' as const, content: reply },
          ].slice(-10);
          setMessages((prev) => [
            ...prev,
            { id: newId(), role: 'assistant', text: reply },
          ]);
        } catch {
          setMessages((prev) => [
            ...prev,
            { id: newId(), role: 'assistant', text: t('chatError') },
          ]);
        } finally {
          setIsSending(false);
        }
      })();
      return;
    }

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: newId(), role: 'assistant', text: t('whatsappAfterHint') },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSending) handleSend();
    }
  };

  const inputPlaceholder =
    phase === 'waiting_choice' ? t('inputPlaceholderChoice') : t('inputPlaceholder');

  const sendDisabled = !input.trim() || isSending;

  return (
    <div className="fixed bottom-5 right-4 z-[100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xl"
            role="dialog"
            aria-modal="false"
            aria-label={t('title')}
          >
            <header className="flex shrink-0 items-start justify-between gap-3 bg-gradient-to-r from-[#00644D] to-[#101919] px-4 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white">{t('title')}</p>
                <p className="truncate text-sm text-white/75">{t('subtitle')}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2F855A] text-white transition-colors hover:bg-[#276749]"
                aria-label={t('closeAria')}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </header>

            <div
              ref={listRef}
              className="max-h-[min(52vh,360px)] min-h-[200px] space-y-3 overflow-y-auto bg-gray-50 px-3 py-4"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={
                      m.role === 'user'
                        ? 'max-w-[85%] rounded-2xl rounded-br-md border border-[#00644d]/25 bg-[#00644d]/12 px-3.5 py-2.5 text-sm leading-relaxed text-gray-900'
                        : 'max-w-[85%] rounded-2xl rounded-bl-md border border-gray-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-gray-800 shadow-sm'
                    }
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {m.role === 'assistant' && m.whatsappHref && m.whatsappLinkLabel && (
                      <a
                        href={m.whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#20bd5a]"
                      >
                        {m.whatsappLinkLabel}
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div
                    className="flex max-w-[85%] items-center gap-1 rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="sr-only">{t('chatLoading')}</span>
                    <span className="flex gap-1.5" aria-hidden>
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-2 w-2 rounded-full bg-[#00644d]/45"
                          animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1, 0.85] }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.18,
                          }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 bg-white p-3">
              <div className="flex items-end gap-2 rounded-xl border-2 border-gray-200 bg-white px-2 py-1.5 transition-colors focus-within:border-[#00644d] focus-within:ring-2 focus-within:ring-[#00644d]/15">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={inputPlaceholder}
                  disabled={isSending}
                  className="max-h-28 min-h-[44px] w-full resize-none bg-transparent px-2 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-60"
                  aria-label={inputPlaceholder}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sendDisabled}
                  className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#5AB678] to-[#20B6B3] text-white shadow-sm transition-all hover:from-[#20B6B3] hover:to-[#00644d] disabled:pointer-events-none disabled:opacity-40"
                  aria-label={t('sendAria')}
                >
                  <Send className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        layout
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#5AB678] to-[#20B6B3] text-white shadow-xl ring-2 ring-white/30"
        animate={
          open
            ? { y: 0, scale: 1 }
            : { y: [0, -14, 0], scale: 1 }
        }
        transition={
          open
            ? { duration: 0.2, ease: 'easeOut' }
            : {
                y: {
                  duration: 1.6,
                  repeat: Infinity,
                  ease: [0.45, 0.05, 0.55, 0.95],
                  repeatDelay: 0.2,
                },
              }
        }
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-expanded={open}
        aria-label={open ? t('closeAria') : t('openAria')}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 45 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <X className="h-7 w-7" aria-hidden />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <MessageCircle className="h-7 w-7" aria-hidden />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

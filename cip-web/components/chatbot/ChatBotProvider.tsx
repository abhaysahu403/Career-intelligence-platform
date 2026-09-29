'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import FloatingChatBot from './FloatingChatBot';
import { usePathname } from 'next/navigation';

interface ChatBotContextType {
  sessionType: 'GLOBAL' | 'INTERVIEW' | 'JOB' | 'CERTIFICATE' | 'ANALYTICS';
  setSessionType: (type: 'GLOBAL' | 'INTERVIEW' | 'JOB' | 'CERTIFICATE' | 'ANALYTICS') => void;
  context: Record<string, any>;
  setContext: (context: Record<string, any>) => void;
}

const ChatBotContext = createContext<ChatBotContextType>({
  sessionType: 'GLOBAL',
  setSessionType: () => {},
  context: {},
  setContext: () => {},
});

export const useChatBot = () => useContext(ChatBotContext);

export default function ChatBotProvider({ children }: { children: React.ReactNode }) {
  const [sessionType, setSessionType] = useState<'GLOBAL' | 'INTERVIEW' | 'JOB' | 'CERTIFICATE' | 'ANALYTICS'>('GLOBAL');
  const [context, setContext] = useState<Record<string, any>>({});
  const pathname = usePathname();

  // Auto-detect session type based on current route
  useEffect(() => {
    if (pathname.includes('/interview')) {
      setSessionType('INTERVIEW');
    } else if (pathname.includes('/jobs')) {
      setSessionType('JOB');
    } else if (pathname.includes('/certificates')) {
      setSessionType('CERTIFICATE');
    } else if (pathname.includes('/analytics') || pathname.includes('/dashboard')) {
      setSessionType('ANALYTICS');
    } else {
      setSessionType('GLOBAL');
    }
  }, [pathname]);

  return (
    <ChatBotContext.Provider value={{ sessionType, setSessionType, context, setContext }}>
      {children}
      <FloatingChatBot sessionType={sessionType} context={context} />
    </ChatBotContext.Provider>
  );
}

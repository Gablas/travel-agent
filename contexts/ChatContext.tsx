import { generateAPIUrl } from '@/utils';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from '@ai-sdk/ui-utils';
import { fetch as expoFetch } from 'expo/fetch';
import React, { createContext, useContext, useEffect, type ReactNode } from 'react';

interface ChatContextType {
  messages: UIMessage[];
  input: string;
  handleInputChange: (text: string) => void;
  handleSubmit: () => void;
  isLoading: boolean;
  loadingStatus: 'thinking' | 'researching' | 'planning' | 'generating';
  isVisible: boolean;
  toggleChat: () => void;
  showChat: () => void;
  hideChat: () => void;
  status: 'submitted' | 'streaming' | 'ready' | 'error';
  lastPart: "reasoning" | "text" | "tool-invocation" | "source" | "file" | "step-start" | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [loadingStatus, setLoadingStatus] = React.useState<'thinking' | 'researching' | 'planning' | 'generating'>('thinking');
  const [lastPart, setLastPart] = React.useState<"reasoning" | "text" | "tool-invocation" | "source" | "file" | "step-start" | null>(null);

  const {
    messages,
    handleInputChange: originalHandleInputChange,
    input,
    handleSubmit: originalHandleSubmit,
    status
  } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    onError: error => console.error(error, 'ERROR'),
    experimental_throttle: 200,
    onFinish: () => {
      setLoadingStatus('thinking');
    },
    id: 'travel-chat',
  });

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log('Latest message structure:', {
        id: lastMessage.id,
        role: lastMessage.role,
        hasCreatedAt: !!lastMessage.createdAt,
        messageCount: messages.length
      });
    }
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.parts?.length > 0) {
      setLastPart(lastMessage.parts[lastMessage.parts.length - 1].type);
    }
  }, [messages]);

  const handleInputChange = (text: string) => {
    originalHandleInputChange({
      target: { value: text }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleSubmit = () => {
    if (isLoading) return; // Prevent submission while loading


    originalHandleSubmit();
  };

  const toggleChat = () => {
    setIsVisible(prev => !prev);
  };

  const showChat = () => {
    setIsVisible(true);
  };

  const hideChat = () => {
    setIsVisible(false);
  };

  const isLoading = status !== 'ready';

  const contextValue: ChatContextType = {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    isLoading,
    loadingStatus,
    isVisible,
    toggleChat,
    showChat,
    hideChat,
    lastPart,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useGlobalChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useGlobalChat must be used within a ChatProvider');
  }
  return context;
}
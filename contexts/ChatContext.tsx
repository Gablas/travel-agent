import React, { createContext, useContext, type ReactNode } from 'react';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { generateAPIUrl } from '@/utils';
import type { UIMessage } from '@ai-sdk/ui-utils';

interface ChatContextType {
  messages: UIMessage[];
  input: string;
  handleInputChange: (text: string) => void;
  handleSubmit: () => void;
  isLoading: boolean;
  isVisible: boolean;
  toggleChat: () => void;
  showChat: () => void;
  hideChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  
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
    experimental_throttle: 200
  });

  const handleInputChange = (text: string) => {
    originalHandleInputChange({
      target: { value: text }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleSubmit = () => {
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

  const isLoading = status === 'streaming' || status === 'submitted';

  const contextValue: ChatContextType = {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isVisible,
    toggleChat,
    showChat,
    hideChat,
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
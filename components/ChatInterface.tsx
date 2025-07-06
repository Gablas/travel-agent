import React, { useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Message } from './Message';
import type { UIMessage } from '@ai-sdk/ui-utils';

interface ChatInterfaceProps {
  messages: UIMessage[];
  input: string;
  onInputChange: (text: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
}


export function ChatInterface({ 
  messages, 
  input, 
  onInputChange, 
  onSubmit, 
  isLoading = false,
  placeholder = "Plan your next adventure..." 
}: ChatInterfaceProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSubmit();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🤖 AI Travel Assistant</Text>
          <Text style={styles.headerSubtitle}>Ask me anything about your trips</Text>
        </View>
        {isLoading && (
          <View style={styles.loadingIndicator}>
            <Text style={styles.loadingText}>●</Text>
            <Text style={styles.loadingText}>●</Text>
            <Text style={styles.loadingText}>●</Text>
          </View>
        )}
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✈️</Text>
            <Text style={styles.emptyTitle}>Ready to plan your next trip?</Text>
            <Text style={styles.emptySubtitle}>Ask me to create itineraries, find destinations, or manage your existing trips!</Text>
          </View>
        ) : (
          messages.map((message, index) => (
            <View key={message.id || index} style={styles.messageWrapper}>
              <Message message={message} />
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.textInput,
              isLoading && styles.textInputDisabled
            ]}
            placeholder={placeholder}
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={onInputChange}
            onSubmitEditing={handleSubmit}
            editable={!isLoading}
            multiline
            maxLength={1000}
            returnKeyType="send"
            blurOnSubmit={false}
            enablesReturnKeyAutomatically
            textAlignVertical="center"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!input.trim() || isLoading}
          >
            <Text style={[
              styles.sendButtonText,
              (!input.trim() || isLoading) && styles.sendButtonTextDisabled
            ]}>
              {isLoading ? '...' : '→'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: Colors.primary,
    marginHorizontal: 1,
    opacity: 0.7,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageWrapper: {
    marginVertical: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.background,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    maxHeight: 100,
    paddingVertical: 8,
    paddingRight: 8,
  },
  textInputDisabled: {
    opacity: 0.6,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.surface,
  },
  sendButtonTextDisabled: {
    color: Colors.surface,
  },
});
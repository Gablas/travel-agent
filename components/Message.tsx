import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessagePart } from './MessagePart';
import { Colors } from '@/constants/Colors';
import type { UIMessage } from '@ai-sdk/ui-utils';

interface MessageProps {
  message: UIMessage;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';
  const isData = message.role === 'data';

  return (
    <View style={[
      styles.messageContainer,
      isUser && styles.userMessage,
      isAssistant && styles.assistantMessage,
    ]}>
      {!isSystem && !isData && (
        <View style={[
          styles.avatar,
          isUser && styles.userAvatar,
          isAssistant && styles.assistantAvatar,
        ]}>
          <Text style={styles.avatarText}>
            {isUser ? '👤' : '🤖'}
          </Text>
        </View>
      )}
      
      <View style={[
        styles.bubble,
        isUser && styles.userBubble,
        isAssistant && styles.assistantBubble,
        isSystem && styles.systemBubble,
        isData && styles.dataBubble,
      ]}>
        {(isSystem || isData) && (
          <View style={styles.systemHeader}>
            <Text style={styles.systemIcon}>
              {isSystem ? '⚙️' : '📊'}
            </Text>
            <Text style={styles.systemLabel}>
              {message.role.charAt(0).toUpperCase() + message.role.slice(1)}
            </Text>
          </View>
        )}
        
        <View style={styles.content}>
          {message.parts.length === 0 ? (
            <Text style={styles.emptyMessage}>No content</Text>
          ) : (
            message.parts.map((part, index) => (
              <MessagePart key={`${message.id}-${index}`} part={part} index={index} />
            ))
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    paddingHorizontal: 4,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    marginTop: 4,
  },
  userAvatar: {
    backgroundColor: Colors.chatBubbleUser,
  },
  assistantAvatar: {
    backgroundColor: Colors.primary,
  },
  avatarText: {
    fontSize: 14,
    color: Colors.surface,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  userBubble: {
    backgroundColor: Colors.chatBubbleUser,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: Colors.chatBubbleAssistant,
    borderWidth: 1,
    borderColor: Colors.chatBubbleBorder,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
  },
  systemBubble: {
    backgroundColor: Colors.warning,
    alignSelf: 'center',
    maxWidth: '90%',
    borderRadius: 12,
  },
  dataBubble: {
    backgroundColor: Colors.info,
    alignSelf: 'center',
    maxWidth: '90%',
    borderRadius: 12,
  },
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  systemIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  systemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.surface,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  emptyMessage: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
import type { UIMessage } from '@ai-sdk/ui-utils';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';
import { MessagePart } from './MessagePart';

interface MessageProps {
  message: UIMessage;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isData = message.role === 'data';

  // Filter and organize message parts
  const otherParts = message.parts.filter(part => part.type !== 'reasoning');

  // Skip system and data messages entirely
  if (isSystem || isData) {
    return null;
  }

  // Create subtle micro-animation that moves up just a few pixels
  const enteringAnimation = FadeIn
    .duration(120)
    .easing(Easing.out(Easing.ease))
    .delay(isUser ? 12 : 25)
    .withInitialValues({
      transform: [{ translateY: 16 }], // Start 8px below final position
      opacity: 0
    });

  return (
    <Animated.View entering={enteringAnimation} style={styles.container}>
      {/* Message Header */}
      <Animated.View
        entering={FadeIn
          .duration(60)
          .easing(Easing.out(Easing.ease))
          .delay(isUser ? 25 : 37)
          .withInitialValues({
            transform: [{ translateY: 4 }], // Start 4px below
            opacity: 0
          })}
        style={styles.header}
      >
        <Text variant="titleMedium" style={styles.senderName}>
          {isUser ? 'You' : 'AI Travel Agent'}
        </Text>
        <Text variant="bodyMedium" style={styles.timeText}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} AM
        </Text>
      </Animated.View>

      {/* Message Content */}
      <Animated.View
        entering={FadeIn
          .duration(70)
          .easing(Easing.out(Easing.ease))
          .delay(isUser ? 37 : 50)
          .withInitialValues({
            transform: [{ translateY: 6 }], // Start 6px below
            opacity: 0
          })}
        style={styles.contentContainer}
      >
        {message.parts.length === 0 ? (
          <Text style={styles.noContentText}>
            No content
          </Text>
        ) : (
          <View style={styles.partsContainer}>
            {otherParts.map((part, index) => (
              <MessagePart
                key={`${message.id}-text-${index}`}
                part={part}
                index={index}
                messageRole={message.role}
              />
            ))}
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  senderName: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#111827',
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#6b7280',
  },
  reasoningContainer: {
    gap: 8,
    marginTop: 8,
  },
  reasoningButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  reasoningButtonText: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  reasoningContent: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#8b5cf6',
    marginLeft: 8,
    gap: 8,
  },
  reasoningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reasoningTitle: {
    fontWeight: '600',
    color: '#8b5cf6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasoningDivider: {
    backgroundColor: '#e5e7eb',
  },
  contentContainer: {
    gap: 4,
  },
  noContentText: {
    color: '#6b7280',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontStyle: 'italic',
  },
  partsContainer: {
    gap: 4,
  },
});
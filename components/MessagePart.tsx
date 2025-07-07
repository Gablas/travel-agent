import { useGlobalChat } from '@/contexts/ChatContext';
import type { UIMessage } from '@ai-sdk/ui-utils';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Text } from 'react-native-paper';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Extract the part types from the actual AI SDK UIMessage
export type UIMessagePart = UIMessage['parts'][number];

interface MessagePartProps {
  part: UIMessagePart;
  index: number;
  messageRole?: string;
}

export function MessagePart({ part, index, messageRole }: MessagePartProps) {
  const { hideChat } = useGlobalChat();

  // Create a subtle micro-animation with small upward movement
  const staggerDelay = index * 10; // 40ms / 4 = 10ms delay between parts
  const enteringAnimation = FadeIn
    .duration(120)
    .easing(Easing.out(Easing.ease))
    .delay(62 + staggerDelay) // 250ms / 4 = ~62ms base delay
    .withInitialValues({
      transform: [{ translateY: 16 }], // Start just 16px below final position
      opacity: 0
    });

  // Pulse animation for tool calls in progress
  const pulseValue = useSharedValue(1);

  // Check if this is a tool call that's still in progress
  const isToolInProgress = part.type === 'tool-invocation' &&
    part.toolInvocation.state !== 'result';

  // Helper function to parse tool result JSON
  const parseToolResult = (result: string) => {
    try {
      return JSON.parse(result);
    } catch {
      return null;
    }
  };

  // Helper function to handle navigation
  const handleToolClick = (toolName: string, result: string) => {
    const parsedResult = parseToolResult(result);
    if (!parsedResult) return;

    // Close the chat before navigating
    hideChat();

    if (parsedResult.type === 'entry_created' && parsedResult.entryId) {
      router.push({
        pathname: "/activity/[id]",
        params: { id: parsedResult.entryId }
      });
    } else if ((parsedResult.type === 'day_created' || parsedResult.type === 'day_ready') && parsedResult.tripId) {
      router.push({
        pathname: "/trip/[id]",
        params: { id: parsedResult.tripId }
      });
    }
  };

  // Helper function to get display message
  const getDisplayMessage = (toolName: string, result: string) => {
    const parsedResult = parseToolResult(result);
    if (parsedResult?.message) {
      return parsedResult.message;
    }
    return result;
  };

  // Helper function to check if tool result is clickable
  const isClickable = (toolName: string, result: string) => {
    const parsedResult = parseToolResult(result);
    return parsedResult && (parsedResult.type === 'entry_created' || parsedResult.type === 'day_created' || parsedResult.type === 'day_ready');
  };

  useEffect(() => {
    if (isToolInProgress) {
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(pulseValue);
      pulseValue.value = withTiming(1, { duration: 200 });
    }
  }, [isToolInProgress, pulseValue]);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseValue.value,
    };
  });

  const renderContent = () => {
    switch (part.type) {
      case 'text':
        return (
          <View>
            <Markdown
              style={{
                body: {
                  fontSize: 16,
                  lineHeight: 24,
                  color: '#111827',
                  margin: 0,
                  fontFamily: 'PlusJakartaSans_400Regular',
                },
                paragraph: {
                  marginBottom: 0,
                  color: '#111827',
                  lineHeight: 24,
                  fontFamily: 'PlusJakartaSans_400Regular',
                },
                heading1: {
                  fontSize: 24,
                  fontWeight: 'bold',
                  marginBottom: 16,
                  color: '#1a202c',
                  lineHeight: 32,
                },
                heading2: {
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginBottom: 14,
                  color: '#1a202c',
                  lineHeight: 28,
                },
                heading3: {
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 12,
                  color: '#1a202c',
                  lineHeight: 26,
                },
                strong: {
                  fontWeight: '600',
                  color: '#1a202c',
                },
                em: {
                  fontStyle: 'italic',
                  color: '#4a5568',
                },
                code_inline: {
                  backgroundColor: '#f1f5f9',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  fontSize: 14,
                  color: '#2d3748',
                },
                code_block: {
                  backgroundColor: '#f8fafc',
                  padding: 16,
                  borderRadius: 8,
                  fontFamily: 'monospace',
                  fontSize: 14,
                  marginVertical: 12,
                  color: '#2d3748',
                  borderLeftWidth: 3,
                  borderLeftColor: '#cbd5e0',
                },
                list_item: {
                  marginBottom: 6,
                  color: '#1a202c',
                  lineHeight: 24,
                }
              }}
            >
              {part.text}
            </Markdown>
          </View>
        );

      case 'reasoning':
        return (
          <View>
            <Markdown
              style={{
                body: {
                  fontSize: 14,
                  lineHeight: 20,
                  color: '#4a5568',
                  margin: 0,
                },
                paragraph: {
                  marginBottom: 8,
                  color: '#4a5568',
                },
                heading1: {
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 8,
                  color: '#2d3748',
                },
                heading2: {
                  fontSize: 15,
                  fontWeight: 'bold',
                  marginBottom: 6,
                  color: '#2d3748',
                },
                strong: {
                  fontWeight: 'bold',
                  color: '#2d3748',
                },
                em: {
                  fontStyle: 'italic',
                  color: '#4a5568',
                },
                code_inline: {
                  backgroundColor: '#f1f5f9',
                  paddingHorizontal: 4,
                  paddingVertical: 2,
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: '#2d3748',
                }
              }}
            >
              {part.reasoning}
            </Markdown>
          </View>
        );
      case 'tool-invocation': {
        const getToolIcon = (toolName: string) => {
          switch (toolName) {
            case 'searchAndContents':
            case 'getContent':
              return <Icon name="search" size={28} color="#6b7280" />;
            case 'createTrip':
            case 'createDay':
            case 'createEntry':
            case 'createMultipleEntries':
            case 'getOrCreateDay':
              return <Icon name="add" size={28} color="#6b7280" />;
            case 'updateTrip':
              return <Icon name="edit" size={28} color="#6b7280" />;
            case 'deleteTrip':
            case 'deleteEntry':
            case 'deleteMultipleEntries':
            case 'clearDay':
              return <Icon name="delete" size={28} color="#6b7280" />;
            case 'getTrips':
            case 'getTrip':
            case 'findEntriesByName':
            case 'findEntriesByCategory':
            case 'findEntriesByDay':
              return <Icon name="list" size={28} color="#6b7280" />;
            default:
              return <Icon name="bolt" size={28} color="#6b7280" />;
          }
        };

        const getToolDisplayName = (toolName: string) => {
          switch (toolName) {
            case 'searchAndContents':
              return 'Searching for Information';
            case 'getContent':
              return 'Getting Content';
            case 'createTrip':
              return 'Creating Trip';
            case 'createDay':
            case 'getOrCreateDay':
              return 'Creating Day';
            case 'createEntry':
              return 'Creating Activity';
            case 'createMultipleEntries':
              return 'Creating Activities';
            case 'updateTrip':
              return 'Updating Trip';
            case 'deleteTrip':
              return 'Deleting Trip';
            case 'deleteEntry':
              return 'Deleting Activity';
            case 'deleteMultipleEntries':
              return 'Deleting Activities';
            case 'clearDay':
              return 'Clearing Day';
            case 'getTrips':
              return 'Getting Trips';
            case 'getTrip':
              return 'Getting Trip Details';
            case 'findEntriesByName':
            case 'findEntriesByCategory':
            case 'findEntriesByDay':
              return 'Finding Activities';
            default:
              return toolName;
          }
        };

        const toolName = part.toolInvocation.toolName;
        const result = part.toolInvocation.state === 'result' ? part.toolInvocation.result : null;
        const isCompleted = part.toolInvocation.state === 'result';
        const clickable = isCompleted && result && isClickable(toolName, result);

        const ToolContent = (
          <Animated.View style={[styles.toolInvocation, isToolInProgress ? pulseStyle : undefined]}>
            <View style={styles.toolIcon}>{getToolIcon(toolName)}</View>
            <View style={styles.toolTextContainer}>
              <Text style={styles.toolText}>
                {getToolDisplayName(toolName)}
              </Text>
              {clickable && (
                <Text style={styles.clickHint}>
                  Tap to view
                </Text>
              )}
            </View>
          </Animated.View>
        );

        if (clickable) {
          return (
            <TouchableOpacity
              onPress={() => handleToolClick(toolName, result)}
              style={styles.clickableContainer}
            >
              {ToolContent}
            </TouchableOpacity>
          );
        }

        return ToolContent;
      }
      case 'source':
      case 'file':
      case 'step-start':
        return null;

      default:
        return null;
    }
  };

  return (
    <Animated.View entering={enteringAnimation}>
      {renderContent()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toolInvocation: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingVertical: 8,
    marginVertical: 4,
  },
  toolIcon: {
    backgroundColor: '#deecfa',
    fontSize: 16,
    padding: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolText: {
    color: '#6b7280',
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
  },
  toolTextContainer: {
    flexDirection: 'column',
  },
  clickHint: {
    color: '#3b82f6',
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  clickableContainer: {
    borderRadius: 8,
    padding: 4,
    marginHorizontal: -4,
  },
});


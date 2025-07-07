import { useGlobalChat } from '@/contexts/ChatContext';
import { useKeyboardAvoidance } from '@/hooks/useKeyboardAvoidance';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Message } from './Message';

export function ChatOverlay() {
  const { messages, input, handleInputChange, handleSubmit, isVisible, hideChat, status, lastPart } = useGlobalChat();
  const { inputContainerStyle, messagesContainerStyle } = useKeyboardAvoidance({
    iosWordSuggestionHeight: 60,
  });

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={hideChat}
          style={styles.backButton}
        />
        <Text style={styles.title}>
          Trip Planner
        </Text>
        <View style={styles.spacer} />
      </View>

      {/* Messages Area */}
      <View style={[styles.messagesContainer, messagesContainerStyle]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {messages.length === 0 ? (
            null
          ) : (
            <View style={styles.messagesList}>
              {messages.map((message, index) => {
                // Ensure each message has a stable, unique key
                // If message.id is missing, generate a stable fallback
                const messageKey = message.id || `message-${message.role}-${message.createdAt?.getTime() || index}`;

                // Log warning if message.id is missing (for debugging)
                if (!message.id) {
                  console.warn('Message missing ID:', { role: message.role, content: message.content?.substring(0, 50) });
                }

                return (
                  <Message key={messageKey} message={message} />
                );
              })}
              {lastPart === 'reasoning' && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <Text style={{ color: "black" }}>Thinking...</Text>
                </Animated.View>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Enhanced Input Area */}
      <View style={[styles.inputContainer, inputContainerStyle]}>
        <TextInput
          value={input}
          editable={status === 'ready' || status === 'error'}
          onChangeText={handleInputChange}
          placeholder={status === 'ready' || status === 'error' ? "Type a message" : "Thinking..."}
          placeholderTextColor="#999"
          returnKeyType='done'
          onSubmitEditing={handleSubmit}
          style={styles.textInput}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 400,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    zIndex: 1000,
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
    paddingTop: 32,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 48,
    height: 48,
    margin: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#121416',
    textAlign: 'center',
    flex: 1,
    paddingRight: 48,
    letterSpacing: -0.015,
    lineHeight: 22,
  },
  spacer: {
    width: 0,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    minHeight: '100%',
  },
  emptyState: {
    paddingVertical: 20,
    gap: 24,
  },
  agentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  messageContainer: {
    gap: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageSender: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  messageTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#111827',
  },
  messagesList: {
    gap: 16,
    paddingTop: 8,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    paddingBottom: 20,
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#111827',
    minHeight: 40,
    maxHeight: 120,
    textAlignVertical: 'top',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
});
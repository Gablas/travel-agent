import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Message } from './Message';
import { useGlobalChat } from '@/contexts/ChatContext';

const { width, height } = Dimensions.get('window');

export function ChatOverlay() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isVisible,
    hideChat,
  } = useGlobalChat();

  const slideAnim = useRef(new Animated.Value(width)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (isVisible) {
      // Slide in from right
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out to right
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, opacityAnim]);

  useEffect(() => {
    if (messages.length > 0 && isVisible) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isVisible]);

  const handleOverlayPress = () => {
    hideChat();
  };

  const handleChatPress = (event: any) => {
    event.stopPropagation();
  };

  const handleSubmitMessage = () => {
    if (input.trim() && !isLoading) {
      handleSubmit();
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return gestureState.dx > 10 && Math.abs(gestureState.dy) < 100;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dx > 0) {
        slideAnim.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > width * 0.3) {
        hideChat();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  if (!isVisible && slideAnim._value === width) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: opacityAnim,
        },
      ]}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        style={styles.backdrop}
        onPress={handleOverlayPress}
        activeOpacity={1}
      />
      
      <Animated.View
        style={[
          styles.chatContainer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.chatContent}
          onPress={handleChatPress}
          activeOpacity={1}
        >
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            {/* Chat Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>🤖 AI Travel Assistant</Text>
                <Text style={styles.headerSubtitle}>
                  {messages.length === 0 ? 'Start planning your trip...' : `${messages.length} messages`}
                </Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={hideChat}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              {isLoading && (
                <View style={styles.loadingIndicator}>
                  <Text style={styles.loadingDot}>●</Text>
                  <Text style={styles.loadingDot}>●</Text>
                  <Text style={styles.loadingDot}>●</Text>
                </View>
              )}
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>✈️</Text>
                  <Text style={styles.emptyTitle}>Ready to plan?</Text>
                  <Text style={styles.emptySubtitle}>
                    Ask me anything about your trips, destinations, or travel plans!
                  </Text>
                </View>
              ) : (
                messages.map((message, index) => (
                  <View key={message.id || index} style={styles.messageWrapper}>
                    <Message message={message} />
                  </View>
                ))
              )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.textInput,
                    isLoading && styles.textInputDisabled
                  ]}
                  placeholder="Type your message..."
                  placeholderTextColor={Colors.textMuted}
                  value={input}
                  onChangeText={handleInputChange}
                  onSubmitEditing={handleSubmitMessage}
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
                  onPress={handleSubmitMessage}
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
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  chatContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: width > 768 ? 400 : width * 0.9,
    maxWidth: 450,
  },
  chatContent: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.surface,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.surface,
    fontWeight: '600',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  loadingDot: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageWrapper: {
    marginVertical: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
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
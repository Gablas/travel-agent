import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useGlobalChat } from '@/contexts/ChatContext';

export function ChatToggleButton() {
  const { isVisible, toggleChat, messages, isLoading } = useGlobalChat();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Add a little scale animation for feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    toggleChat();
  };

  const hasUnreadIndicator = messages.length > 0 && !isVisible;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] },
        isVisible && styles.containerHidden
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          isLoading && styles.buttonLoading
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {hasUnreadIndicator && (
          <Animated.View style={styles.unreadIndicator}>
            <Text style={styles.unreadCount}>
              {messages.length > 99 ? '99+' : messages.length}
            </Text>
          </Animated.View>
        )}
        
        <Text style={styles.buttonText}>
          {isLoading ? '💭' : '🤖'}
        </Text>
        
        {isLoading && (
          <Animated.View style={styles.loadingRing} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 999,
  },
  containerHidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  buttonLoading: {
    backgroundColor: Colors.primaryDark,
  },
  buttonText: {
    fontSize: 24,
    textAlign: 'center',
  },
  unreadIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.surface,
  },
  loadingRing: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: Colors.surface,
    opacity: 0.7,
  },
});
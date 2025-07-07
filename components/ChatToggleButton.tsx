import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobalChat } from '@/contexts/ChatContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

export function ChatToggleButton() {
  const { isVisible, toggleChat } = useGlobalChat();

  if (isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={toggleChat}
        style={styles.button}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6']}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.gradient}
        >
          <Icon name="smart-toy" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  button: {
    borderRadius: 64,
    overflow: 'hidden',
  },
  gradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
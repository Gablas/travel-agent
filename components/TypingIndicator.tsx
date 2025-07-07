import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface TypingIndicatorProps {
  status?: 'thinking' | 'researching' | 'planning' | 'generating';
}

export function TypingIndicator({ status = 'thinking' }: TypingIndicatorProps) {
  return (
    <View style={styles.container}>
      {/* Activity Indicators */}
      <View style={styles.activityContainer}>
        <View style={styles.activityRow}>
          <Text style={styles.activityIcon}>🔍</Text>
          <Text variant="bodyMedium" style={styles.activityText}>
            Searching for Information
          </Text>
        </View>
        <View style={styles.activityRow}>
          <Text style={styles.activityIcon}>➕</Text>
          <Text variant="bodyMedium" style={styles.activityText}>
            Creating Activities
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  activityContainer: {
    gap: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  activityIcon: {
    fontSize: 16,
  },
  activityText: {
    color: '#6b7280',
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
  },
});
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import type { Id } from '@/convex/_generated/dataModel';

interface TripCardProps {
  trip: {
    _id: Id<"trips">;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status: string;
    budget?: number;
    travelers?: number;
  };
  onPress: () => void;
}

export function TripCard({ trip, onPress }: TripCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            {trip.name}
          </Text>
          <Text variant="bodyMedium" style={styles.status}>
            {trip.status}
          </Text>
          <View style={styles.dateContainer}>
            <Text variant="bodySmall" style={styles.dateText}>
              Start Date: {trip.startDate || 'Not set'}
            </Text>
            <Text variant="bodySmall" style={styles.dateText}>
              End Date: {trip.endDate || 'Not set'}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    margin: 10,
  },
  card: {
    backgroundColor: '#ffffff',
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
  status: {
    color: '#6b7280',
    marginBottom: 12,
  },
  dateContainer: {
    gap: 4,
  },
  dateText: {
    color: '#4b5563',
  },
});
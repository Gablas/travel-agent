import type { Id } from '@/convex/_generated/dataModel';
import type { Trip } from '@/types';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TripsShowcaseProps {
  trips: Trip[] | undefined;
  onTripPress: (tripId: Id<"trips">) => void;
}

export function TripsShowcase({ trips, onTripPress }: TripsShowcaseProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planning': return '#f59e0b';
      case 'active': return '#10b981';
      case 'completed': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planning': return 'event';
      case 'active': return 'flight';
      case 'completed': return 'check-circle';
      default: return 'place';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Trips
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {!trips || trips.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                No trips yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptyDescription}>
                Start planning your next adventure! Chat with our AI assistant to create your first trip.
              </Text>
            </View>
          ) : (
            trips.map((trip) => (
              <TouchableOpacity
                key={trip._id}
                style={styles.tripItem}
                onPress={() => onTripPress(trip._id)}
              >
                <View style={styles.iconContainer}>
                  <Icon
                    name={getCategoryIcon(trip.status)}
                    size={24}
                    color="#6b7280"
                  />
                </View>
                <View style={styles.tripContent}>
                  <View style={styles.tripHeader}>
                    <Text variant="titleMedium" style={styles.tripTitle}>
                      {trip.name}
                    </Text>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(trip.status) }
                    ]} />
                  </View>
                  <Text variant="bodyMedium" style={styles.tripDescription}>
                    {trip.description || `${trip.status.charAt(0).toUpperCase() + trip.status.slice(1)} trip`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#111827',
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    color: '#111827',
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 280,
  },
  tripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripContent: {
    flex: 1,
    gap: 4,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tripTitle: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tripDescription: {
    color: '#6b7280',
    fontSize: 14,
  },
});
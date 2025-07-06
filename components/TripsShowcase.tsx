import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { TripCard } from './TripCard';
import { Colors } from '@/constants/Colors';
import type { Id } from '@/convex/_generated/dataModel';

interface TripsShowcaseProps {
  trips: {
    _id: Id<"trips">;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status: string;
    budget?: number;
    travelers?: number;
  }[] | undefined;
  onTripPress: (tripId: Id<"trips">) => void;
}

const { width } = Dimensions.get('window');

export function TripsShowcase({ trips, onTripPress }: TripsShowcaseProps) {
  if (!trips || trips.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🌍</Text>
          <Text style={styles.emptyTitle}>No trips yet!</Text>
          <Text style={styles.emptySubtitle}>
            Start planning your dream vacation by chatting with our AI assistant below
          </Text>
          <View style={styles.emptyFeatures}>
            <Text style={styles.emptyFeature}>✈️ Create custom itineraries</Text>
            <Text style={styles.emptyFeature}>🏨 Find the best accommodations</Text>
            <Text style={styles.emptyFeature}>🗺️ Discover hidden gems</Text>
            <Text style={styles.emptyFeature}>💰 Stay within your budget</Text>
          </View>
        </View>
      </View>
    );
  }

  const isWideScreen = width > 768;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Trips</Text>
        <Text style={styles.subtitle}>
          {trips.length} trip{trips.length === 1 ? '' : 's'} • Tap to view details
        </Text>
      </View>

      <ScrollView
        horizontal={!isWideScreen}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContainer,
          isWideScreen && styles.gridContainer
        ]}
      >
        {trips.map((trip) => (
          <TripCard
            key={trip._id}
            trip={trip}
            onPress={() => onTripPress(trip._id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  scrollContainer: {
    paddingHorizontal: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: Colors.tripCardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    maxWidth: 400,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyFeatures: {
    alignItems: 'flex-start',
    width: '100%',
  },
  emptyFeature: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'left',
  },
});
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { DayWithEntries, Entry } from '@/types';
import { useQuery } from 'convex/react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TripDetailProps {
  tripId: Id<"trips">;
  onBack: () => void;
}

export function TripDetail({ tripId, onBack }: TripDetailProps) {
  const trip = useQuery(api.trips.getTripWithDaysAndEntries, { tripId });

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'transport':
      case 'flight': return 'flight';
      case 'hotel': return 'hotel';
      case 'attraction':
      case 'landmark': return 'place';
      case 'restaurant': return 'restaurant';
      case 'museum': return 'museum';
      case 'park': return 'park';
      case 'shopping': return 'shopping-cart';
      case 'nightlife': return 'local-bar';
      case 'activity': return 'local-activity';
      default: return 'place';
    }
  };

  const handleEntryPress = (entryId: Id<"entries">) => {
    router.push({
      pathname: "/activity/[id]",
      params: { id: entryId }
    });
  };

  if (!trip) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="headlineSmall" style={styles.loadingText}>
          Loading trip...
        </Text>
      </View>
    );
  }

  // Group entries by day
  const groupedByDay = trip.days?.reduce((acc, day) => {
    if (day.entries && day.entries.length > 0) {
      acc[day.dayNumber] = {
        day: day,
        entries: day.entries.sort((a, b) => a.order - b.order)
      };
    }
    return acc;
  }, {} as Record<number, { day: DayWithEntries; entries: Entry[] }>) || {};

  const sortedDays = Object.keys(groupedByDay)
    .map(Number)
    .sort((a, b) => a - b);

  const hasEntries = sortedDays.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={onBack}
          style={styles.backButton}
        />
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Trip
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {!hasEntries ? (
            <View style={styles.emptyState}>
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                No itinerary yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptyDescription}>
                Chat with our AI assistant to start planning your activities!
              </Text>
            </View>
          ) : (
            sortedDays.map((dayNumber) => {
              const { day, entries } = groupedByDay[dayNumber];
              return (
                <View key={dayNumber} style={styles.daySection}>
                  <Text style={styles.dayHeader}>
                    Day {dayNumber}
                  </Text>
                  <View style={styles.dayEntries}>
                    {entries.map((entry) => (
                      <TouchableOpacity
                        key={entry._id}
                        style={styles.entryItem}
                        onPress={() => handleEntryPress(entry._id)}
                      >
                        <View style={styles.iconContainer}>
                          <Icon
                            name={getCategoryIcon(entry.category)}
                            size={24}
                            color="#6b7280"
                          />
                        </View>
                        <View style={styles.entryContent}>
                          <Text variant="titleMedium" style={styles.entryTitle}>
                            {entry.name}
                          </Text>
                          <Text variant="bodyMedium" style={styles.entryTime}>
                            {entry.timestamp}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })
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
  }, headerTitle: {
    color: '#111827',
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    color: '#111827',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 32,
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
  daySection: {
    gap: 16,
  },
  dayHeader: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 8,
  },
  dayEntries: {
    gap: 20,
  },
  entryItem: {
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
  entryContent: {
    flex: 1,
    gap: 4,
  },
  entryTitle: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 16,
  },
  entryTime: {
    color: '#6b7280',
    fontSize: 14,
  },
});
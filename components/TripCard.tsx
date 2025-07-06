import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
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

const { width } = Dimensions.get('window');
const cardWidth = width > 768 ? (width - 48) / 2 : width - 32;

export function TripCard({ trip, onPress }: TripCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planned':
        return Colors.info;
      case 'booked':
        return Colors.success;
      case 'ongoing':
        return Colors.warning;
      case 'completed':
        return Colors.textMuted;
      default:
        return Colors.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planned':
        return '📋';
      case 'booked':
        return '✅';
      case 'ongoing':
        return '🧳';
      case 'completed':
        return '🏆';
      default:
        return '🗺️';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {trip.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) }]}>
            <Text style={styles.statusIcon}>{getStatusIcon(trip.status)}</Text>
            <Text style={styles.statusText}>{trip.status}</Text>
          </View>
        </View>
      </View>

      {trip.description && (
        <Text style={styles.description} numberOfLines={2}>
          {trip.description}
        </Text>
      )}

      <View style={styles.cardContent}>
        <View style={styles.dateContainer}>
          {trip.startDate && (
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Start</Text>
              <Text style={styles.dateValue}>{trip.startDate}</Text>
            </View>
          )}
          {trip.endDate && (
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>End</Text>
              <Text style={styles.dateValue}>{trip.endDate}</Text>
            </View>
          )}
        </View>

        <View style={styles.metaContainer}>
          {trip.budget && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>💰</Text>
              <Text style={styles.metaText}>${trip.budget.toLocaleString()}</Text>
            </View>
          )}
          {trip.travelers && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>👥</Text>
              <Text style={styles.metaText}>{trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.tripCard,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: Colors.tripCardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.tripCardBorder,
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.surface,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateItem: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cardFooter: {
    padding: 16,
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  viewDetails: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
});
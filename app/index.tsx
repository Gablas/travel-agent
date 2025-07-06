import { TripDetail } from '@/components/TripDetail';
import { TripsShowcase } from '@/components/TripsShowcase';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { useState } from 'react';
import { SafeAreaView, View, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function App() {
  const [selectedTripId, setSelectedTripId] = useState<Id<"trips"> | null>(null);
  const trips = useQuery(api.tripsSimple.getTrips);

  // If a trip is selected, show the trip detail view
  if (selectedTripId) {
    return (
      <SafeAreaView style={styles.container}>
        <TripDetail 
          tripId={selectedTripId} 
          onBack={() => setSelectedTripId(null)} 
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        <TripsShowcase
          trips={trips}
          onTripPress={setSelectedTripId}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainContent: {
    flex: 1,
  },
  wideScreenLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  mobileLayout: {
    flex: 1,
    flexDirection: 'column',
  },
  tripsSection: {
    flex: width > 768 ? 0.4 : 0,
    minHeight: width > 768 ? 'auto' : 200,
    maxHeight: width > 768 ? 'auto' : 300,
    backgroundColor: Colors.background,
    borderRightWidth: width > 768 ? 1 : 0,
    borderBottomWidth: width > 768 ? 0 : 1,
    borderColor: Colors.borderLight,
  },
  chatSection: {
    flex: width > 768 ? 0.6 : 1,
    backgroundColor: Colors.surface,
  },
});
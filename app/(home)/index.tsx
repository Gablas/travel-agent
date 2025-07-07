import { TripsShowcase } from '@/components/TripsShowcase';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function TripsPage() {
    const trips = useQuery(api.trips.getTrips);

    const handleTripPress = (tripId: Id<"trips">) => {
        router.push({
            pathname: "/trip/[id]",
            params: { id: tripId }
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <TripsShowcase
                trips={trips}
                onTripPress={handleTripPress}
            />
        </View>
    );
} 
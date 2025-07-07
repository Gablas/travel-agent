import { TripDetail } from '@/components/TripDetail';
import type { Id } from '@/convex/_generated/dataModel';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function TripDetailPage() {
    const { id } = useLocalSearchParams<{ id: string }>();

    if (!id) {
        router.replace('/');
        return null;
    }

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={{ flex: 1 }}>
            <TripDetail
                tripId={id as Id<"trips">}
                onBack={handleBack}
            />
        </View>
    );
} 
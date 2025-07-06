import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';

interface TripDetailProps {
  tripId: Id<"trips">;
  onBack: () => void;
}

export function TripDetail({ tripId, onBack }: TripDetailProps) {
  const trip = useQuery(api.tripsSimple.getTrip, { tripId });
  
  if (!trip) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Loading trip details...</Text>
      </View>
    );
  }

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {/* Header */}
      <View style={{ marginBottom: 20 }}>
        <TouchableOpacity 
          onPress={onBack}
          style={{ marginBottom: 12, padding: 8, backgroundColor: '#e0e0e0', borderRadius: 4, alignSelf: 'flex-start' }}
        >
          <Text style={{ fontWeight: 'bold' }}>← Back to Trips</Text>
        </TouchableOpacity>
        
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>{trip.name}</Text>
        {trip.description && (
          <Text style={{ fontSize: 16, color: '#666', marginBottom: 12 }}>{trip.description}</Text>
        )}
        
        {/* Trip Info */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          {trip.startDate && (
            <View style={{ backgroundColor: '#f0f0f0', padding: 8, borderRadius: 6 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>Start Date</Text>
              <Text style={{ fontWeight: 'bold' }}>{trip.startDate}</Text>
            </View>
          )}
          {trip.endDate && (
            <View style={{ backgroundColor: '#f0f0f0', padding: 8, borderRadius: 6 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>End Date</Text>
              <Text style={{ fontWeight: 'bold' }}>{trip.endDate}</Text>
            </View>
          )}
          {trip.budget && (
            <View style={{ backgroundColor: '#f0f0f0', padding: 8, borderRadius: 6 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>Budget</Text>
              <Text style={{ fontWeight: 'bold' }}>${trip.budget}</Text>
            </View>
          )}
          {trip.travelers && (
            <View style={{ backgroundColor: '#f0f0f0', padding: 8, borderRadius: 6 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>Travelers</Text>
              <Text style={{ fontWeight: 'bold' }}>{trip.travelers}</Text>
            </View>
          )}
          <View style={{ backgroundColor: '#f0f0f0', padding: 8, borderRadius: 6 }}>
            <Text style={{ fontSize: 12, color: '#666' }}>Status</Text>
            <Text style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{trip.status}</Text>
          </View>
        </View>

        {trip.notes && (
          <View style={{ backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>Notes:</Text>
            <Text style={{ fontSize: 14 }}>{trip.notes}</Text>
          </View>
        )}
      </View>

      {/* Trip Links */}
      {trip.links && trip.links.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Trip Resources</Text>
          {trip.links.map((link, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleLinkPress(link.url)}
              style={{ 
                backgroundColor: '#e3f2fd', 
                padding: 12, 
                borderRadius: 8, 
                marginBottom: 8,
                borderLeftWidth: 4,
                borderLeftColor: '#2196f3'
              }}
            >
              <Text style={{ fontWeight: 'bold', color: '#1976d2' }}>{link.title}</Text>
              <Text style={{ fontSize: 12, color: '#666', textTransform: 'capitalize' }}>{link.type}</Text>
              {link.description && (
                <Text style={{ fontSize: 14, marginTop: 4 }}>{link.description}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Daily Itinerary */}
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Daily Itinerary</Text>
      
      {trip.days && trip.days.length > 0 ? (
        trip.days.map((day, index) => (
          <DayDetailSimple key={index} day={day} />
        ))
      ) : (
        <View style={{ backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ color: '#666', fontStyle: 'italic' }}>No days planned yet</Text>
          <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
            Ask the AI assistant to create a detailed itinerary for your trip!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

interface DayDetailSimpleProps {
  day: {
    date: string;
    dayNumber: number;
    title?: string;
    description?: string;
    notes?: string;
    visits: {
      place: {
        name: string;
        description?: string;
        address?: string;
        city?: string;
        country?: string;
        latitude?: number;
        longitude?: number;
        placeType: string;
        priceLevel?: string;
        rating?: number;
        openingHours?: string;
        phone?: string;
        website?: string;
        googleMapsUrl?: string;
        googlePlaceId?: string;
        images?: string[];
        tags?: string[];
        notes?: string;
      };
      startTime?: string;
      endTime?: string;
      duration?: number;
      order: number;
      status: string;
      notes?: string;
      estimatedCost?: number;
      actualCost?: number;
    }[];
    transportation: {
      type: string;
      duration?: number;
      distance?: number;
      cost?: number;
      notes?: string;
      bookingUrl?: string;
      fromPlace?: string;
      toPlace?: string;
    }[];
  };
}

function DayDetailSimple({ day }: DayDetailSimpleProps) {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  return (
    <View style={{ marginBottom: 24, backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
      {/* Day Header */}
      <View style={{ backgroundColor: '#4CAF50', padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
          Day {day.dayNumber}: {day.title || day.date}
        </Text>
        {day.date && (
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{day.date}</Text>
        )}
        {day.description && (
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4 }}>
            {day.description}
          </Text>
        )}
      </View>

      <View style={{ padding: 16 }}>
        {/* Day Notes */}
        {day.notes && (
          <View style={{ backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>Day Notes:</Text>
            <Text style={{ fontSize: 14 }}>{day.notes}</Text>
          </View>
        )}

        {/* Visits */}
        {day.visits && day.visits.length > 0 ? (
          <View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Planned Visits</Text>
            {day.visits
              .sort((a, b) => a.order - b.order)
              .map((visit, index) => (
                <View 
                  key={index} 
                  style={{ 
                    marginBottom: 16,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 8,
                    overflow: 'hidden',
                    borderLeftWidth: 4,
                    borderLeftColor: getPlaceTypeColor(visit.place?.placeType)
                  }}
                >
                  {/* Visit Header */}
                  <View style={{ backgroundColor: '#e9ecef', padding: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                        {index + 1}. {visit.place?.name || 'Unknown Place'}
                      </Text>
                      {visit.place?.placeType && (
                        <View style={{ 
                          backgroundColor: getPlaceTypeColor(visit.place.placeType), 
                          paddingHorizontal: 8, 
                          paddingVertical: 4, 
                          borderRadius: 12 
                        }}>
                          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                            {visit.place.placeType.toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Time Info */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 8 }}>
                      {visit.startTime && (
                        <Text style={{ fontSize: 12, color: '#666' }}>🕐 {visit.startTime}</Text>
                      )}
                      {visit.endTime && (
                        <Text style={{ fontSize: 12, color: '#666' }}>🕐 - {visit.endTime}</Text>
                      )}
                      {visit.duration && (
                        <Text style={{ fontSize: 12, color: '#666' }}>⏱️ {visit.duration} min</Text>
                      )}
                      {visit.estimatedCost && (
                        <Text style={{ fontSize: 12, color: '#666' }}>💰 ${visit.estimatedCost}</Text>
                      )}
                      <Text style={{ fontSize: 12, color: '#666', textTransform: 'capitalize' }}>
                        📍 {visit.status}
                      </Text>
                    </View>
                  </View>

                  {/* Place Details */}
                  {visit.place && (
                    <View style={{ padding: 12 }}>
                      {visit.place.description && (
                        <Text style={{ fontSize: 14, marginBottom: 8, color: '#333' }}>
                          {visit.place.description}
                        </Text>
                      )}
                      
                      {/* Place Info Grid */}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        {visit.place.address && (
                          <View style={{ backgroundColor: '#e3f2fd', padding: 6, borderRadius: 4, flex: 1, minWidth: '45%' }}>
                            <Text style={{ fontSize: 12, color: '#666' }}>📍 Address</Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{visit.place.address}</Text>
                          </View>
                        )}
                        {visit.place.openingHours && (
                          <View style={{ backgroundColor: '#e8f5e8', padding: 6, borderRadius: 4, flex: 1, minWidth: '45%' }}>
                            <Text style={{ fontSize: 12, color: '#666' }}>🕒 Hours</Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{visit.place.openingHours}</Text>
                          </View>
                        )}
                        {visit.place.phone && (
                          <View style={{ backgroundColor: '#fff3e0', padding: 6, borderRadius: 4, flex: 1, minWidth: '45%' }}>
                            <Text style={{ fontSize: 12, color: '#666' }}>📞 Phone</Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{visit.place.phone}</Text>
                          </View>
                        )}
                        {visit.place.priceLevel && (
                          <View style={{ backgroundColor: '#f3e5f5', padding: 6, borderRadius: 4, flex: 1, minWidth: '45%' }}>
                            <Text style={{ fontSize: 12, color: '#666' }}>💲 Price</Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{visit.place.priceLevel}</Text>
                          </View>
                        )}
                        {visit.place.rating && (
                          <View style={{ backgroundColor: '#fff8e1', padding: 6, borderRadius: 4, flex: 1, minWidth: '45%' }}>
                            <Text style={{ fontSize: 12, color: '#666' }}>⭐ Rating</Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{visit.place.rating}/5</Text>
                          </View>
                        )}
                      </View>

                      {/* Links */}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {visit.place?.website && (
                          <TouchableOpacity
                            onPress={() => handleLinkPress(visit.place!.website!)}
                            style={{ backgroundColor: '#2196f3', padding: 8, borderRadius: 6, flex: 1, minWidth: '45%' }}
                          >
                            <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: 'bold' }}>
                              🌐 Website
                            </Text>
                          </TouchableOpacity>
                        )}
                        {visit.place?.googleMapsUrl && (
                          <TouchableOpacity
                            onPress={() => handleLinkPress(visit.place!.googleMapsUrl!)}
                            style={{ backgroundColor: '#4CAF50', padding: 8, borderRadius: 6, flex: 1, minWidth: '45%' }}
                          >
                            <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: 'bold' }}>
                              🗺️ Maps
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Visit Notes */}
                      {visit.notes && (
                        <View style={{ backgroundColor: '#fff3cd', padding: 8, borderRadius: 6, marginTop: 8 }}>
                          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 2 }}>Visit Notes:</Text>
                          <Text style={{ fontSize: 12 }}>{visit.notes}</Text>
                        </View>
                      )}

                      {/* Place Tags */}
                      {visit.place.tags && visit.place.tags.length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 4 }}>
                          {visit.place.tags.map((tag, tagIndex) => (
                            <View key={tagIndex} style={{ backgroundColor: '#e0e0e0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                              <Text style={{ fontSize: 10, color: '#666' }}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}
          </View>
        ) : (
          <View style={{ backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: '#666', fontStyle: 'italic' }}>No visits planned for this day</Text>
          </View>
        )}

        {/* Transportation */}
        {day.transportation && day.transportation.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Transportation</Text>
            {day.transportation.map((transport, index) => (
              <View key={index} style={{ backgroundColor: '#e3f2fd', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', textTransform: 'capitalize' }}>
                  🚗 {transport.type.replace('_', ' ')}
                </Text>
                {transport.fromPlace && transport.toPlace && (
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                    From: {transport.fromPlace} → To: {transport.toPlace}
                  </Text>
                )}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, gap: 8 }}>
                  {transport.duration && (
                    <Text style={{ fontSize: 12, color: '#666' }}>⏱️ {transport.duration} min</Text>
                  )}
                  {transport.distance && (
                    <Text style={{ fontSize: 12, color: '#666' }}>📏 {transport.distance} km</Text>
                  )}
                  {transport.cost && (
                    <Text style={{ fontSize: 12, color: '#666' }}>💰 ${transport.cost}</Text>
                  )}
                </View>
                {transport.notes && (
                  <Text style={{ fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>{transport.notes}</Text>
                )}
                {transport.bookingUrl && (
                  <TouchableOpacity
                    onPress={() => handleLinkPress(transport.bookingUrl!)}
                    style={{ backgroundColor: '#1976d2', padding: 6, borderRadius: 4, marginTop: 8, alignSelf: 'flex-start' }}
                  >
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>Book Transportation</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function getPlaceTypeColor(placeType?: string): string {
  const colors: Record<string, string> = {
    restaurant: '#FF6B6B',
    hotel: '#4ECDC4',
    attraction: '#45B7D1',
    museum: '#96CEB4',
    park: '#FFEAA7',
    shopping: '#DDA0DD',
    nightlife: '#FF7675',
    transport: '#74B9FF',
    activity: '#00B894',
    landmark: '#FDCB6E',
    other: '#B2BEC3'
  };
  return colors[placeType || 'other'] || colors.other;
}
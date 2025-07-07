import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ActivityDetailPage() {
    const { id } = useLocalSearchParams<{ id: string }>();

    if (!id) {
        router.replace('/');
        return null;
    }

    const entry = useQuery(api.entries.getEntry, { entryId: id as Id<"entries"> });

    const handleBack = () => {
        router.back();
    };

    const handleLinkPress = (url: string) => {
        Linking.openURL(url);
    };

    if (!entry) {
        return (
            <View style={styles.loadingContainer}>
                <Text variant="headlineSmall">Activity not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={handleBack}
                    style={styles.backButton}
                />
                <Text variant="headlineSmall" style={styles.headerTitle}>
                    Activity
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>


                <View style={styles.content}>
                    {/* Title */}
                    <Text variant="headlineMedium" style={styles.title}>
                        {entry.name}
                    </Text>

                    {/* Description */}
                    {entry.description && (
                        <Text variant="bodyLarge" style={styles.description}>
                            {entry.description}
                        </Text>
                    )}

                    {/* Useful Links */}
                    <View style={styles.section}>
                        <Text variant="headlineSmall" style={styles.sectionTitle}>
                            Useful Links
                        </Text>

                        <View style={styles.linksContainer}>
                            <TouchableOpacity
                                style={styles.linkItem}
                                onPress={() => handleLinkPress(entry.googleMapsUrl)}
                            >
                                <View style={styles.linkIcon}>
                                    <Icon name="place" size={20} color="#6b7280" />
                                </View>
                                <Text variant="titleMedium" style={styles.linkText}>
                                    Map
                                </Text>
                            </TouchableOpacity>

                            {entry.websiteUrl && (
                                <TouchableOpacity
                                    style={styles.linkItem}
                                    onPress={() => {
                                        if (entry.websiteUrl) {
                                            handleLinkPress(entry.websiteUrl);
                                        }
                                    }}
                                >
                                    <View style={styles.linkIcon}>
                                        <Icon name="language" size={20} color="#6b7280" />
                                    </View>
                                    <Text variant="titleMedium" style={styles.linkText}>
                                        Website
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {entry.additionalLinks?.map((link) => (
                                <TouchableOpacity
                                    key={link}
                                    style={styles.linkItem}
                                    onPress={() => handleLinkPress(link)}
                                >
                                    <View style={styles.linkIcon}>
                                        <Icon name="description" size={20} color="#6b7280" />
                                    </View>
                                    <Text variant="titleMedium" style={styles.linkText}>
                                        Booking Confirmation
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
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
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: '#ffffff',
    },
    backButton: {
        margin: 0,
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
    heroContainer: {
        height: 300,
        backgroundColor: '#f3f4f6',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    content: {
        padding: 24,
        gap: 32,
    },
    title: {
        color: '#111827',
        fontWeight: 'bold',
        marginBottom: 16,
    },
    description: {
        color: '#6b7280',
        lineHeight: 24,
    },
    section: {
        gap: 16,
    },
    sectionTitle: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 20,
    },
    linksContainer: {
        gap: 16,
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    linkIcon: {
        width: 48,
        height: 48,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkText: {
        color: '#111827',
        fontSize: 16,
    },
    contactContainer: {
        gap: 16,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    contactIcon: {
        width: 48,
        height: 48,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactText: {
        color: '#111827',
        fontSize: 16,
    },
    weatherContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    weatherIcon: {
        width: 48,
        height: 48,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    weatherText: {
        color: '#111827',
        fontSize: 16,
    },
}); 
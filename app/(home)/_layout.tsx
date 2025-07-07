import { ChatOverlay } from '@/components/ChatOverlay'
import { ChatToggleButton } from '@/components/ChatToggleButton'
import { ChatProvider } from '@/contexts/ChatContext'
import { useAuth } from '@clerk/clerk-expo'
import { Redirect, Stack } from 'expo-router'

export default function HomeLayout() {
    const { isSignedIn } = useAuth()

    if (!isSignedIn) {
        return <Redirect href="/sign-in" />
    }

    return (
        <ChatProvider>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="trip/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="activity/[id]" options={{ headerShown: false }} />
            </Stack>
            <ChatOverlay />
            <ChatToggleButton />
        </ChatProvider>
    )
} 
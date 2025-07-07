import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Keyboard, Platform } from 'react-native';

interface KeyboardAvoidanceConfig {
    inputTransformRatio?: number;
    maxInputOffset?: number;
    messagesPaddingRatio?: number;
    minMessagesPadding?: number;
    keyboardThreshold?: number;
    iosWordSuggestionHeight?: number;
}

interface KeyboardAvoidanceState {
    isKeyboardVisible: boolean;
    keyboardHeight: number;
    inputContainerStyle: {
        transform: { translateY: number }[];
    };
    messagesContainerStyle: {
        paddingBottom: number;
    };
}

const DEFAULT_CONFIG: Required<KeyboardAvoidanceConfig> = {
    inputTransformRatio: 0.8,
    maxInputOffset: 400,
    messagesPaddingRatio: 0.3,
    minMessagesPadding: 50,
    keyboardThreshold: 150,
    iosWordSuggestionHeight: 50,
};

export function useKeyboardAvoidance(config: KeyboardAvoidanceConfig = {}): KeyboardAvoidanceState {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const handleKeyboardShow = useCallback((height: number) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(height);
    }, []);

    const handleKeyboardHide = useCallback(() => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
    }, []);

    useEffect(() => {
        if (Platform.OS === 'web') {
            return setupWebKeyboardListeners(handleKeyboardShow, handleKeyboardHide, finalConfig.keyboardThreshold);
        }
        return setupNativeKeyboardListeners(handleKeyboardShow, handleKeyboardHide);
    }, [handleKeyboardShow, handleKeyboardHide, finalConfig.keyboardThreshold]);

    const adjustedKeyboardHeight = isKeyboardVisible && keyboardHeight > 0
        ? keyboardHeight + (Platform.OS === 'ios' ? finalConfig.iosWordSuggestionHeight : 0)
        : 0;

    const inputTransform = adjustedKeyboardHeight > 0
        ? -Math.min(adjustedKeyboardHeight * finalConfig.inputTransformRatio, finalConfig.maxInputOffset)
        : 0;

    const messagesPadding = adjustedKeyboardHeight > 0
        ? Math.max(adjustedKeyboardHeight * finalConfig.messagesPaddingRatio, finalConfig.minMessagesPadding)
        : 0;

    return {
        isKeyboardVisible,
        keyboardHeight,
        inputContainerStyle: {
            transform: [{ translateY: inputTransform }],
        },
        messagesContainerStyle: {
            paddingBottom: messagesPadding,
        },
    };
}

function setupWebKeyboardListeners(
    onShow: (height: number) => void,
    onHide: () => void,
    threshold: number
): () => void {
    const screenHeight = Dimensions.get('window').height;

    const handleViewportChange = () => {
        const currentHeight = window.visualViewport?.height || window.innerHeight;
        const heightDiff = screenHeight - currentHeight;

        if (heightDiff > threshold) {
            onShow(heightDiff);
        } else {
            onHide();
        }
    };

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleViewportChange);
        return () => {
            window.visualViewport?.removeEventListener('resize', handleViewportChange);
        };
    }

    window.addEventListener('resize', handleViewportChange);
    return () => {
        window.removeEventListener('resize', handleViewportChange);
    };
}

function setupNativeKeyboardListeners(
    onShow: (height: number) => void,
    onHide: () => void
): () => void {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, (event) => {
        onShow(event.endCoordinates.height);
    });

    const hideListener = Keyboard.addListener(hideEvent, onHide);

    return () => {
        showListener.remove();
        hideListener.remove();
    };
} 
import React from 'react';
import { Button } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { Vibration, Platform } from 'react-native';

export default function HapticButton(props) {
    const { onPress, ...rest } = props;

    const handlePress = async (...args) => {
        // Try expo-haptics first
        try {
            await Haptics.selectionAsync();
        } catch (e) {
            // Fallback: use Vibration for platforms/emulators without haptics
            try {
                // short vibration on Android/iOS
                Vibration.vibrate(10);
            } catch (v) {
                // ignore
            }
        }

        if (onPress) return onPress(...args);
    };

    return <Button {...rest} onPress={handlePress} />;
}

import { StyleSheet, View, ScrollView, Linking, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Text, Card, Divider, useTheme } from "react-native-paper";
import HapticButton from "../components/HapticButton";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export default function Profile() {
    const theme = useTheme();
    const colors = theme.colors;
    const [username, setUsername] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem('pingme_username');
                if (stored) setUsername(stored);
            } catch (err) {
                console.warn('Failed to read username for profile', err);
            }
        })();
    }, []);

    const performLogout = async () => {
        try {
            await AsyncStorage.removeItem('pingme_username');
        } catch (err) {
            console.warn('Failed to clear storage on logout', err);
        } finally {
            router.replace('/');
        }
    };

    const confirmLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: performLogout },
            ],
            { cancelable: true }
        );
    };

    const openInstagram = async () => {
        const url = 'https://instagram.com/the.mohit.kumar';
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) await Linking.openURL(url);
            else console.warn('Cannot open URL:', url);
        } catch (err) {
            console.warn('Error opening URL', err);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Avatar.Text size={96} label={username ? username.slice(0, 2).toUpperCase() : 'MK'} />
                    <Text variant="titleLarge" style={[styles.username, { color: colors.text }]}>{username || 'Mohit Kumar'}</Text>
                </View>

                <Card style={[styles.docsCard, { backgroundColor: colors.surface }]}>
                    <Card.Title title="Documentation" subtitle="Helpful links & info" />
                    <Divider />
                    <Card.Content>
                        <Text variant="bodyMedium" style={[styles.docText, { color: colors.text }]}>
                            Welcome to PingMe. Here you can find quick docs about using the app:
                        </Text>
                        <Text variant="bodySmall" style={[styles.docItem, { color: colors.placeholder }]}>• Configure project alerts in the settings.</Text>
                        <Text variant="bodySmall" style={[styles.docItem, { color: colors.placeholder }]}>• View incoming errors in the Messages tab.</Text>
                        <Text variant="bodySmall" style={[styles.docItem, { color: colors.placeholder }]}>• Tap a message to see full stack traces and details.</Text>
                        <Text variant="bodySmall" style={[styles.docItem, { color: colors.placeholder }]}>• Use Logout below to switch accounts.</Text>
                    </Card.Content>
                </Card>

                <View style={styles.logoutWrap}>
                    <HapticButton mode="contained" onPress={confirmLogout} contentStyle={styles.logoutBtn}>
                        Logout
                    </HapticButton>
                </View>

                <TouchableOpacity onPress={openInstagram} style={styles.creditWrap} activeOpacity={0.7}>
                    <Text variant="bodySmall" style={[styles.creditText, { color: colors.placeholder }]}>
                        Made with ♥ By{' '}
                        <Text style={[styles.creditLink, { color: colors.primary }]}>{' '}Mohit Kumar</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    scroll: { padding: 20, flexGrow: 1 },
    header: { alignItems: 'center', marginTop: 10, marginBottom: 18 },
    username: { marginTop: 12, textAlign: 'center' },
    docsCard: { flex: 1, minHeight: 320, marginBottom: 24 },
    docText: { marginBottom: 8, color: '#374151' },
    docItem: { marginBottom: 6, color: '#4b5563' },
    logoutWrap: { paddingVertical: 8 },
    logoutBtn: { paddingVertical: 8 },
    creditWrap: { alignItems: 'center', marginTop: 12 },
    creditText: { color: '#6b7280' },
    creditLink: { color: '#2563eb', textDecorationLine: 'underline' },
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, Keyboard, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";
import HapticButton from "./components/HapticButton";

export default function Login() {
  const theme = useTheme();
  const colors = theme.colors;
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef(null);

  const handleContinue = () => {
    if (!username.trim()) return;

    // register for push notifications and log the Expo push token
    registerForPushNotificationsAsync().then((tok) => {
      if (tok) console.log('Notification Expo Token:', tok);
    }).catch((e) => console.warn('Push token registration error', e));

    console.log("PingMe Username:", username);

    // persist username so next app open can skip login
    setLoading(true);
    AsyncStorage.setItem('pingme_username', username.trim())
      .catch((err) => console.warn('Failed to save username', err))
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
          router.replace("/(tabs)/messages");
        }, 800);
      });
  };

  useEffect(() => {
    // on mount, decide whether to show splash only on cold app open
    (async () => {
      try {
        const [storedUsername, splashFlag] = await Promise.all([
          AsyncStorage.getItem('pingme_username'),
          AsyncStorage.getItem('pingme_splash_shown'),
        ]);

        // If splash hasn't been shown before, show it for 2s then mark shown
        if (!splashFlag) {
          setTimeout(async () => {
            try {
              await AsyncStorage.setItem('pingme_splash_shown', '1');
            } catch (e) {
              console.warn('Failed to set splash flag', e);
            }

            if (storedUsername && storedUsername.trim()) {
              router.replace("/(tabs)/messages");
            } else {
              setShowSplash(false);
            }
          }, 2000);
        } else {
          // Splash already shown in this install/session — skip immediately
          setShowSplash(false);
          if (storedUsername && storedUsername.trim()) {
            router.replace("/(tabs)/messages");
          }
        }
      } catch (err) {
        console.warn('Error reading stored username or splash flag', err);
        setShowSplash(false);
      }
    })();

    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      const height = e.endCoordinates?.height || 0;
      setKeyboardHeight(height);
      // scroll content so input is visible
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Helper: request permissions and get Expo push token
  async function registerForPushNotificationsAsync() {
    try {
      if (!Device.isDevice) {
        console.warn('Must use physical device for Push Notifications');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData?.data ?? null;

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token;
    } catch (err) {
      console.warn('Error while registering for push notifications', err);
      return null;
    }
  }

  if (showSplash) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: colors.background }]}>
        <Image
          source={require("../assets/images/splash.png")}
          style={styles.splashImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView
        ref={scrollRef}
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.container, { paddingBottom: keyboardHeight + 80 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >

        {/* Logo */}
        <Image
          source={require("../assets/images/pingme-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text variant="headlineMedium" style={styles.title}>
          PingMe
        </Text>

        {/* Tagline */}
        <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.placeholder }]}>
          Get instant project error alerts on your phone
        </Text>

        {/* Illustration */}
        <Image
          source={require("../assets/images/dev-alert.png")}
          style={styles.illustration}
          resizeMode="contain"
        />

        {/* Description */}
        <Text variant="bodySmall" style={[styles.description, { color: colors.text }]}>
          When your project API throws an error, PingMe sends it directly to your
          mobile — so you never miss critical issues.
        </Text>

        {/* Username Input */}
        <TextInput
          label="Create Username"
          mode="outlined"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={[styles.input, { backgroundColor: '#f3f4f6' }]}
          contentStyle={{ paddingVertical: 10 }}
          outlineColor={colors.placeholder}
          activeOutlineColor={colors.primary}
          selectionColor={colors.primary}
          theme={{ ...theme, colors: { ...theme.colors, background: '#f3f4f6' } }}
        />

        {/* Button */}
        <HapticButton
          mode="contained"
          loading={loading}
          disabled={loading || !username.trim()}
          onPress={handleContinue}
          contentStyle={styles.buttonContent}
        >
          {loading ? "Connecting..." : "Continue"}
        </HapticButton>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    justifyContent: 'flex-start',
  },

  logo: {
    width: 64,
    height: 64,
    alignSelf: "center",
    marginBottom: 12,
  },

  title: {
    textAlign: "center",
    marginBottom: 4,
  },

  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 20,
  },

  illustration: {
    width: "100%",
    height: 180,
    marginBottom: 20,
  },
  description: {
    textAlign: "center",
    color: "#4b5563",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  input: {
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  splashContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});


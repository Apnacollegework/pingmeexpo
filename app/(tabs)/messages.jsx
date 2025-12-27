import { StyleSheet, ScrollView, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Card,
    Text,
    IconButton,
    Portal,
    Dialog,
    Button,
} from "react-native-paper";
import { useState, useCallback } from "react";

/* ------------------ Helpers ------------------ */

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
}

function formatTime(date) {
    if (!date) return "Just now";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Just now";

    return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

/* ------------------ Screen ------------------ */

export default function Messages() {
    const userName = "Mohit Kumar";

    const [messages, setMessages] = useState([
        {
            id: 1,
            title: "John Doe",
            subtitle:
                "Hey! How are you doing? Just wanted to check in and see if everything is going well with the project we discussed earlier.",
            time: new Date(),
        },
        {
            id: 2,
            title: "Support",
            subtitle:
                "Your ticket has been resolved successfully. If you face any further issues, feel free to contact our support team anytime.",
            time: "2025-01-10T09:15:00",
        },
        {
            id: 3,
            title: "New User",
            subtitle: "Hello!",
            time: undefined,
        },
    ]);

    const [visible, setVisible] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [refreshing, setRefreshing] = useState(false);

    // 🔽 Track expanded messages
    const [expandedIds, setExpandedIds] = useState([]);

    const toggleExpand = (id) => {
        setExpandedIds((prev) =>
            prev.includes(id)
                ? prev.filter((i) => i !== id)
                : [...prev, id]
        );
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setMessages((prev) => [
                {
                    id: Date.now(),
                    title: "System",
                    subtitle:
                        "Messages refreshed successfully. You now have the latest updates available.",
                    time: new Date(),
                },
                ...prev,
            ]);
            setRefreshing(false);
        }, 1500);
    }, []);

    const showDialog = (id) => {
        setSelectedId(id);
        setVisible(true);
    };

    const hideDialog = () => {
        setVisible(false);
        setSelectedId(null);
    };

    const deleteMessage = () => {
        setMessages((prev) => prev.filter((m) => m.id !== selectedId));
        hideDialog();
    };

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#4f46e5"
                        colors={["#4f46e5"]}
                        title="Refreshing messages..."
                        titleColor="#6b7280"
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text variant="titleMedium" style={styles.greeting}>
                        {getGreeting()},
                    </Text>
                    <Text variant="headlineSmall" style={styles.name}>
                        {userName}
                    </Text>
                </View>

                {/* Messages */}
                {messages.map((msg) => {
                    const isExpanded = expandedIds.includes(msg.id);
                    const showExpand = msg.subtitle.length > 80;

                    return (
                        <Card key={msg.id} style={styles.card}>
                            {/* Title Row */}
                            <Card.Title
                                title={msg.title}
                                right={() => (
                                    <View style={styles.rightContainer}>
                                        <Text style={styles.inlineTime}>
                                            {formatTime(msg.time)}
                                        </Text>

                                        <IconButton
                                            icon="delete"
                                            iconColor="#ef4444"
                                            size={20}
                                            onPress={() => showDialog(msg.id)}
                                        />
                                    </View>
                                )}
                            />

                            {/* Message Row with inline expand icon */}
                            <View style={styles.messageRow}>
                                <Text
                                    style={styles.messageText}
                                    numberOfLines={isExpanded ? undefined : 2}
                                >
                                    {msg.subtitle}
                                </Text>

                                {showExpand && (
                                    <IconButton
                                        icon={isExpanded ? "chevron-up" : "chevron-down"}
                                        size={18}
                                        onPress={() => toggleExpand(msg.id)}
                                        style={styles.expandIcon}
                                    />
                                )}
                            </View>
                        </Card>
                    );
                })}


                {/* Delete Dialog */}
                <Portal>
                    <Dialog visible={visible} onDismiss={hideDialog}>
                        <Dialog.Title>Delete Message</Dialog.Title>
                        <Dialog.Content>
                            <Text>
                                Are you sure you want to delete this message?
                            </Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={hideDialog}>Cancel</Button>
                            <Button textColor="#ef4444" onPress={deleteMessage}>
                                Delete
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </ScrollView>
        </SafeAreaView>
    );
}

/* ------------------ Styles ------------------ */

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    container: {
        paddingBottom: 80,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    greeting: {
        color: "#6b7280",
    },
    name: {
        fontWeight: "700",
    },
    card: {
        margin: 10,
        borderRadius: 6,
        elevation: 1,
    },
    rightContainer: {
        alignItems: "flex-end",
        justifyContent: "center",
        marginRight: 4,
    },
    inlineTime: {
        fontSize: 11,
        color: "#9ca3af",
        marginBottom: -4,
    },
    iconRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    messageBody: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    messageRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        paddingBottom: 12,
    },

    messageText: {
        flex: 1,
        lineHeight: 20,
    },

    expandIcon: {
        marginTop: -4,
    },
});

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, Linking, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabase';
import ScreenWrapper from '@/components/ScreenWrapper';
import { Picker } from '@react-native-picker/picker';
import Loading from '@/components/Loading';
import UserHeader from '@/components/UserHeader';
import { useTheme } from '@/context/ThemeContext';
import { Theme } from '@/constants/theme';
import ActionButton from '@/components/ActionButton';
import { useLocalSearchParams } from 'expo-router';
import Icon from '@/assets/icons';

interface Settlement {
    id: string;
    group_id: number;
    amount: number;
    payment_mode: 'upi' | 'cash' | null;
    is_paid: boolean;
    created_at: string;
    paid_at: string | null;
    from_user: { id: string; name: string } | null;
    to_user: { id: string; name: string } | null;
    points_earned: number | null;
}

const Settlement = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { groupId } = useLocalSearchParams<{ groupId: string }>();

    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedModes, setSelectedModes] = useState<{ [id: string]: 'upi' | 'cash' | undefined }>({});

    useEffect(() => {
        if (user && groupId) fetchSettlements();
    }, [user, groupId]);

    const fetchSettlements = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('settlements')
                .select('*, from_user:from_user_id(*), to_user:to_user_id(*)')
                .eq('group_id', Number(groupId))
                .order('created_at', { ascending: false })
                .returns<Settlement[]>();

            if (error) {
                console.error('Error fetching settlements:', error);
                Alert.alert('Error', 'Failed to fetch settlements');
                return; // Important: Exit the function on error
            }
            setSettlements(data || []);
        } catch (error) {
            console.error("Error during fetchSettlements:", error);
            Alert.alert('Error', 'An unexpected error occurred while fetching settlements.');
        } finally {
            setLoading(false);
        }
    };

    const initiateUpiPayment = async (settlement: Settlement) => {
        if (!settlement.to_user?.id) {
            Alert.alert('Error', 'Receiver information missing.');
            return;
        }

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('upi')
            .eq('id', settlement.to_user.id)
            .single();

        if (userError || !userData) {
            Alert.alert('Error', 'Failed to fetch receiver UPI ID');
            return;
        }

        const UPI_ID = userData.upi;
        const amount = settlement.amount.toFixed(2);
        const transactionNote = 'FairShare Payment';

        const url = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(
            settlement.to_user.name
        )}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert('Error', 'No UPI app found.');
        }
    };

    const handlePay = async (id: string) => {
        const mode = selectedModes[id];
        if (!mode) return Alert.alert('Select payment mode');

        const settlement = settlements.find((s) => s.id === id);
        if (!settlement) return;

        if (mode === 'upi') {
            await initiateUpiPayment(settlement);
        }

        try {
            const { error } = await supabase
                .from('settlements')
                .update({ payment_mode: mode })
                .eq('id', id);

            if (error) {
                console.error(error);
                Alert.alert('Error', 'Payment failed');
            } else {
                fetchSettlements();
            }
        } catch (error) {
            console.error("Error during handlePay", error);
            Alert.alert('Error', 'An unexpected error occurred during payment.');
        }
    };

    const handleReceived = async (id: string) => {
        try {
            const now = new Date().toISOString();
            const settlement = settlements.find(s => s.id === id);
            if (!settlement) return;
    
            const pointsEarned = calculatePoints(settlement.created_at, now);
    
            // Step 1: Update the settlement with paid info & earned points
            const { data: updatedSettlement, error: updateError } = await supabase
                .from('settlements')
                .update({
                    is_paid: true,
                    paid_at: now,
                    points_earned: pointsEarned,
                })
                .eq('id', id)
                .select()
                .single();
    
            if (updateError) {
                console.error("Error updating settlement:", updateError);
                Alert.alert('Error', 'Failed to confirm receipt.');
                return;
            }
    
            // Step 2: Update points for the payer (from_user)
            if (settlement.from_user?.id) {
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('points')
                    .eq('id', settlement.from_user.id)
                    .single();
    
                if (userError || !userData) {
                    console.error("Error fetching user points:", userError);
                    Alert.alert('Error', 'Could not fetch user points.');
                    return;
                }
    
                const previousPoints = userData.points ?? 0;
                const updatedPoints = previousPoints === 0
                    ? pointsEarned
                    : Math.floor((previousPoints + pointsEarned) / 2);
    
                const { error: updatePointsError } = await supabase
                    .from('users')
                    .update({ points: updatedPoints })
                    .eq('id', settlement.from_user.id);
    
                if (updatePointsError) {
                    console.error("Error updating user points:", updatePointsError);
                    Alert.alert('Error', 'Failed to update user points.');
                    return;
                }
            }
    
            fetchSettlements();
    
        } catch (error) {
            console.error("Error during handleReceived:", error);
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    };    

    const calculatePoints = (created_at: string | undefined, paid_at: string | undefined): number => {
        if (!created_at || !paid_at) return 0;

        const createdDate = new Date(created_at);
        const paidDate = new Date(paid_at);
        const diffInDays = Math.ceil((paidDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays <= 1) {
            return 10;
        } else if (diffInDays <= 3) {
            return 5;
        } else {
            return 2;
        }
    };

    const renderYouOweItem = ({ item }: { item: Settlement }) => (
        <View style={styles.settlementCard}>
            <View style={styles.settlementInfo}>
                <Text style={styles.infoLabel}>To:</Text>
                <Text style={styles.infoText}>{item.to_user?.name}</Text>
            </View>
            <View style={styles.settlementInfo}>
                <Text style={styles.infoLabel}>Amount:</Text>
                <Text style={styles.amount}>₹{item.amount}</Text>
            </View>
            <Text style={styles.metaText}>
                Created: {new Date(item.created_at).toLocaleDateString()}
            </Text>
            <View style={styles.paymentControls}>
                {item.paid_at === null && (
                    <>
                        <Picker
                            selectedValue={selectedModes[item.id]}
                            onValueChange={(value) =>
                                setSelectedModes((prev) => ({ ...prev, [item.id]: value }))
                            }
                            style={styles.picker}
                            dropdownIconColor={theme.colors.text}
                        >
                            <Picker.Item label="Select Mode" value={undefined} />
                            <Picker.Item label="UPI" value="upi" />
                            <Picker.Item label="Cash" value="cash" />
                        </Picker>
                        <ActionButton
                            icon={<Icon name="expenses" />}
                            title="Pay"
                            onPress={() => handlePay(item.id)}
                            color={theme.colors.success}
                        />
                    </>
                )}
            </View>
        </View>
    );

    const renderYouAreOwedItem = ({ item }: { item: Settlement }) => {
        return (
            <View style={styles.settlementCard}>
                <View style={styles.settlementInfo}>
                    <Text style={styles.infoLabel}>From:</Text>
                    <Text style={styles.infoText}>{item.from_user?.name}</Text>
                </View>
                <View style={styles.settlementInfo}>
                    <Text style={styles.infoLabel}>Amount:</Text>
                    <Text style={styles.amount}>₹{item.amount}</Text>
                </View>
                <Text style={styles.metaText}>Mode: {item.payment_mode ?? 'Not selected'}</Text>
                <Text style={styles.metaText}>
                    Created: {new Date(item.created_at).toLocaleDateString()}
                </Text>
                {item.is_paid ? (
                    <Text style={styles.paidStatus}>
                        Paid on {item.paid_at ? new Date(item.paid_at).toLocaleDateString() : 'N/A'}
                        {item.points_earned !== null && (
                            <Text> (Points: {item.points_earned})</Text>
                        )}
                    </Text>
                ) : item.payment_mode === 'cash' || item.payment_mode === 'upi' ? (
                    <ActionButton
                        icon={<Icon name="expenses" />}
                        title="Mark as Received"
                        onPress={() => handleReceived(item.id)}
                        color={theme.colors.primary}
                    />
                ) : (
                    <Text style={styles.pendingStatus}>Pending...</Text>
                )}
            </View>
        );
    };

    if (!user) {
        return (
            <ScreenWrapper>
                <Text style={styles.emptyAuthText}>
                    You must be logged in to view settlements.
                </Text>
            </ScreenWrapper>
        );
    }

    if (loading) return <Loading />;

    const youOwe = settlements.filter((s) => s.from_user?.id === user.id);
    const youAreOwed = settlements.filter((s) => s.to_user?.id === user.id);

    return (
        <ScreenWrapper>
            <UserHeader title="Settle" />
            <ScrollView>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>You Owe Others</Text>
                    <FlatList
                        data={youOwe}
                        keyExtractor={(item) => item.id}
                        renderItem={renderYouOweItem}
                        ListEmptyComponent={
                            <Text style={styles.emptyListText}>You're all settled up! 🎉</Text>
                        }
                        scrollEnabled={false}
                    />
                </View>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>People Owe You</Text>
                    <FlatList
                        data={youAreOwed}
                        keyExtractor={(item) => item.id}
                        renderItem={renderYouAreOwedItem}
                        ListEmptyComponent={
                            <Text style={styles.emptyListText}>No one owes you anything! 💰</Text>
                        }
                        scrollEnabled={false}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const getStyles = (theme: Theme) =>
    StyleSheet.create({
        sectionContainer: {
            marginBottom: theme.spacing.lg,
            paddingHorizontal: theme.spacing.md,
        },
        sectionTitle: {
            fontSize: theme.fontSizes.lg,
            fontWeight: theme.fonts.semibold,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
        },
        settlementCard: {
            backgroundColor: theme.colors.cardBackground,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.sm,
            borderWidth: theme.borderWidth.thin,
            borderColor: theme.colors.border,
        },
        settlementInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        infoLabel: {
            fontSize: theme.fontSizes.md,
            color: theme.colors.textLight,
            marginRight: theme.spacing.sm,
        },
        infoText: {
            fontSize: theme.fontSizes.md,
            color: theme.colors.text,
            fontWeight: theme.fonts.medium,
        },
        amount: {
            fontSize: theme.fontSizes.lg,
            fontWeight: theme.fonts.bold,
            color: theme.colors.accentLight,
        },
        metaText: {
            fontSize: theme.fontSizes.sm,
            color: theme.colors.textLight,
            marginBottom: theme.spacing.xs,
            fontStyle: 'italic',
        },
        paymentControls: {
            marginTop: theme.spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
        },
        picker: {
            flex: 1,
            borderColor: theme.colors.border,
            borderWidth: theme.borderWidth.thin,
            borderRadius: theme.radius.sm,
            color: theme.colors.text,
            marginRight: theme.spacing.sm,
            backgroundColor: theme.colors.cardBackground,
        },
        paidStatus: {
            fontSize: theme.fontSizes.sm,
            fontWeight: theme.fonts.bold,
            color: theme.colors.success,
            marginTop: theme.spacing.xs,
        },
        pendingStatus: {
            fontSize: theme.fontSizes.sm,
            fontWeight: theme.fonts.bold,
            color: theme.colors.warning,
            marginTop: theme.spacing.xs,
        },
        emptyListText: {
            fontSize: theme.fontSizes.md,
            color: theme.colors.textLight,
            fontStyle: 'italic',
            textAlign: 'center',
            paddingVertical: theme.spacing.lg,
        },
        emptyAuthText: {
            fontSize: theme.fontSizes.md,
            color: theme.colors.textLight,
            textAlign: 'center',
            padding: theme.spacing.lg,
        },
    });

export default Settlement;


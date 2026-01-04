import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants/theme';

const HomeScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ວັດປ່າສັນຕິສຸຂ</Text>
                <Text style={styles.headerSubtitle}>ບ້ານ ດອນໜູນ ເມືອງ ໄຊທານີ ນະຄອນຫຼວງວຽງຈັນ</Text>
            </View>

            {/* Quick navigation options */}
            <View style={styles.optionsContainer}>
                <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate('WorkSchedule')}>
                    <Text style={styles.optionIcon}>📅</Text>
                    <Text style={styles.optionTitle}>ກິດນິມົນ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate('Activities')}>
                    <Text style={styles.optionIcon}>📋</Text>
                    <Text style={styles.optionTitle}>ກິດຈະວັດ</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    headerTitle: { fontSize: 30, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 5, textAlign: 'center' },
    headerSubtitle: { fontSize: 16, color: COLORS.secondary, opacity: 0.9, textAlign: 'center' },
    optionsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 15 },
    optionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', width: '45%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    optionIcon: { fontSize: 32, marginBottom: 8 },
    optionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
});

export default HomeScreen;

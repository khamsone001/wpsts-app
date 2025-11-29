import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants/theme';
import AttendanceReportScreen from './AttendanceReportScreen';

const ActivitiesScreen = ({ navigation }) => {
    const { userRole } = useAuth();
    const [selectedTab, setSelectedTab] = useState('main'); // 'main', 'sub', or 'report'

    const isSuperAdmin = userRole === 'super_admin';

    const mainRoutines = [
        { id: 'A', name: 'ບິນທະບາດ', description: '' },
        { id: 'B', name: 'ໄຫວ້ພຣະແລງ', description: '' },
        { id: 'C', name: 'ໄຫວ້ພຣະເຊົ້າ', description: '' },
        { id: 'D', name: 'ວຽກຕອນເຊົ້າ', description: 'ປັດເດີ່ນວັດ,ຖູສາລາ' },
    ];

    const subRoutines = [
        { id: 'E', name: 'ຫົດດອກໄມ້', description: '' },
        { id: 'F', name: 'ຕີກອງ', description: '' },
        { id: 'G', name: 'ເຝົ້າສາລາ', description: '' },
    ];

    const canManageAttendance = ['super_admin', 'admin'].includes(userRole);
    const currentRoutines = selectedTab === 'main' ? mainRoutines : subRoutines;

    return (
        <View style={styles.container}>
            {/* Tab Buttons */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'main' && styles.activeTab]}
                    onPress={() => setSelectedTab('main')}
                >
                    <Text style={[styles.tabText, selectedTab === 'main' && styles.activeTabText]}>
                        ກິດຈະວັດຫຼັກ
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'sub' && styles.activeTab]}
                    onPress={() => setSelectedTab('sub')}
                >
                    <Text style={[styles.tabText, selectedTab === 'sub' && styles.activeTabText]}>
                        ກິດຈະວັດຍ່ອຍ
                    </Text>
                </TouchableOpacity>
                {isSuperAdmin && (
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'report' && styles.activeTab]}
                        onPress={() => setSelectedTab('report')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'report' && styles.activeTabText]}>
                            ສະຫຼຸບ ລາຍງານ
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Content based on selected tab */}
            {selectedTab === 'report' ? (
                <AttendanceReportScreen />
            ) : (
                <>
                    {/* Routines List */}
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.title}>
                            {selectedTab === 'main' ? 'ກິດຈະວັດຫຼັກ' : 'ກິດຈະວັດຍ່ອຍ'}
                        </Text>

                        {currentRoutines.map(routine => (
                            <TouchableOpacity
                                key={routine.id}
                                style={styles.card}
                                onPress={() => navigation.navigate('RoutineAttendance', {
                                    routine: routine.id,
                                    routineName: routine.name,
                                    routineDesc: routine.description
                                })}
                            >
                                <Text style={styles.routineName}>{routine.name}</Text>
                                <Text style={styles.routineDesc}>{routine.description}</Text>
                                <Text style={styles.tapHint}>ກົດເພື່ອເຂົ້າເບິ່ງລາຍລະອຽດ →</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: COLORS.background,
        gap: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 15,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    activeTab: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
    },
    activeTabText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    scrollContent: {
        flexGrow: 1,
        padding: SIZES.padding,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 20,
    },
    card: {
        backgroundColor: COLORS.secondary,
        padding: 15,
        borderRadius: SIZES.radius,
        marginBottom: 15,
        elevation: 3,
    },
    routineName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    routineDesc: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    tapHint: {
        fontSize: 12,
        color: COLORS.primary,
        marginTop: 8,
        fontStyle: 'italic',
    },
    attendanceButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        margin: SIZES.padding,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    attendanceButtonText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ActivitiesScreen;

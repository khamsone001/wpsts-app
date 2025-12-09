import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants/theme';
import AttendanceReportScreen from './AttendanceReportScreen';
import routineService from '../services/routineService';

const ActivitiesScreen = ({ navigation }) => {
    const { userRole } = useAuth();
    const [selectedTab, setSelectedTab] = useState('main'); // 'main', 'sub', or 'report'
    const [mainRoutines, setMainRoutines] = useState([]);
    const [subRoutines, setSubRoutines] = useState([]);
    const [loading, setLoading] = useState(true);

    const isSuperAdmin = userRole === 'super_admin';

    useEffect(() => {
        fetchRoutines();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchRoutines();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchRoutines = async () => {
        setLoading(true);
        const allRoutines = await routineService.getAllRoutines();
        setMainRoutines(allRoutines.filter(r => r.type === 'main').sort((a, b) => a.order - b.order));
        setSubRoutines(allRoutines.filter(r => r.type === 'sub').sort((a, b) => a.order - b.order));
        setLoading(false);
    };

    const handleDeleteRoutine = async (routine) => {
        Alert.alert(
            'ລຶບກິດຈະວັດ',
            `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ "${routine.name}"?`,
            [
                { text: 'ຍົກເລີກ', style: 'cancel' },
                {
                    text: 'ລຶບ',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await routineService.deleteRoutine(routine.id);
                        if (result.success) {
                            Alert.alert('ສຳເລັດ', 'ລຶບກິດຈະວັດສຳເລັດ');
                            fetchRoutines();
                        } else {
                            Alert.alert('ຜິດພາດ', result.error);
                        }
                    }
                }
            ]
        );
    };

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
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'report' && styles.activeTab]}
                    onPress={() => setSelectedTab('report')}
                >
                    <Text style={[styles.tabText, selectedTab === 'report' && styles.activeTabText]}>
                        ສະຫຼຸບ ລາຍງານ
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content based on selected tab */}
            {selectedTab === 'report' ? (
                <AttendanceReportScreen />
            ) : loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <>
                    {/* Routines List */}
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.titleRow}>
                            <Text style={styles.title}>
                                {selectedTab === 'main' ? 'ກິດຈະວັດຫຼັກ' : 'ກິດຈະວັດຍ່ອຍ'}
                            </Text>
                            {isSuperAdmin && (
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => navigation.navigate('ManageRoutine', { type: selectedTab })}
                                >
                                    <Text style={styles.addButtonText}>+ ເພີ່ມ</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {currentRoutines.map(routine => (
                            <View key={routine.id} style={styles.cardWrapper}>
                                <TouchableOpacity
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
                                {isSuperAdmin && (
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            onPress={() => navigation.navigate('ManageRoutine', { routine, type: selectedTab })}
                                        >
                                            <Text style={styles.editButtonText}>✏️</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => handleDeleteRoutine(routine)}
                                        >
                                            <Text style={styles.deleteButtonText}>🗑️</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addButtonText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    cardWrapper: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'center',
    },
    card: {
        flex: 1,
        backgroundColor: COLORS.secondary,
        padding: 15,
        borderRadius: SIZES.radius,
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
    actionButtons: {
        flexDirection: 'row',
        marginLeft: 10,
    },
    editButton: {
        backgroundColor: COLORS.goldLight,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    editButtonText: {
        fontSize: 18,
    },
    deleteButton: {
        backgroundColor: '#ff4444',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: 18,
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

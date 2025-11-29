import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { UserService } from '../services/userService';
import { RoutineService } from '../services/routineService';

const AttendanceScreen = () => {
    const [users, setUsers] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [usersData, attendanceData] = await Promise.all([
            UserService.getAllUsers(),
            RoutineService.getAttendance(date)
        ]);
        // Filter out managers
        const filteredUsers = usersData.filter(user => user.role !== 'manager');
        setUsers(filteredUsers);
        setAttendance(attendanceData);
        setLoading(false);
    };

    const handleStatusChange = async (uid, currentStatus) => {
        const newStatus = currentStatus === 'Present' ? 'Leave' : 'Present';

        // Optimistic update
        setAttendance(prev => ({ ...prev, [uid]: newStatus }));

        const result = await RoutineService.updateAttendance(date, uid, newStatus);
        if (!result.success) {
            Alert.alert('Error', 'Failed to update status');
            // Revert
            setAttendance(prev => ({ ...prev, [uid]: currentStatus }));
        }
    };

    const renderItem = ({ item }) => {
        const status = attendance[item.uid] || 'Absent'; // Default to Absent if not set
        const isPresent = status === 'Present';
        const isLeave = status === 'Leave';

        return (
            <View style={styles.card}>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.personalInfo?.name || item.email}</Text>
                    <Text style={styles.details}>{item.personalInfo?.class || '-'}</Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.statusButton, isPresent && styles.presentActive]}
                        onPress={() => handleStatusChange(item.uid, status === 'Present' ? 'Absent' : 'Present')}
                    >
                        <Text style={[styles.statusText, isPresent && styles.activeText]}>P</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statusButton, isLeave && styles.leaveActive]}
                        onPress={() => handleStatusChange(item.uid, status === 'Leave' ? 'Absent' : 'Leave')}
                    >
                        <Text style={[styles.statusText, isLeave && styles.activeText]}>L</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.dateText}>Date: {date}</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={item => item.uid}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 15,
        backgroundColor: COLORS.secondary,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    list: {
        padding: SIZES.padding,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.secondary,
        padding: 15,
        borderRadius: SIZES.radius,
        marginBottom: 10,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    details: {
        fontSize: 14,
        color: '#666',
    },
    actions: {
        flexDirection: 'row',
    },
    statusButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    presentActive: {
        backgroundColor: 'green',
    },
    leaveActive: {
        backgroundColor: 'orange',
    },
    statusText: {
        fontWeight: 'bold',
        color: '#666',
    },
    activeText: {
        color: 'white',
    },
});

export default AttendanceScreen;

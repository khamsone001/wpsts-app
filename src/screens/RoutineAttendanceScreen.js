import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Image, FlatList, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SIZES } from '../constants/theme';
import { UserService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { mergeAdminRecords } from '../utils/attendanceMerger';
import routineAttendanceService from '../services/routineAttendanceService';

const RoutineAttendanceScreen = ({ route, navigation }) => {
    const { routine, routineName } = route.params;
    const { user, userRole } = useAuth();
    const [users, setUsers] = useState([]);
    const [adminRecords, setAdminRecords] = useState({});
    const [mergedRecords, setMergedRecords] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedUser, setSelectedUser] = useState(null);
    const [userModalVisible, setUserModalVisible] = useState(false);
    const [noteModalVisible, setNoteModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [isReadOnly, setIsReadOnly] = useState(false);

    // Tab and filter states - Default to 'my' for better admin UX
    const [selectedTab, setSelectedTab] = useState('my');
    const [selectedAdminFilter, setSelectedAdminFilter] = useState('merged');
    const [adminList, setAdminList] = useState([]);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const isAdmin = userRole === 'admin' || userRole === 'super_admin';
    const isSuperAdmin = userRole === 'super_admin';

    // Lao Month Names
    const laoMonths = [
        'ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ',
        'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'
    ];

    useEffect(() => {
        navigation.setOptions({
            title: routineName || `Routine ${routine}`,
        });
    }, [navigation, routineName, routine]);

    useEffect(() => {
        fetchData();
    }, [currentMonth, currentYear]);

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    useEffect(() => {
        // Recalculate merged records when admin records change
        const merged = mergeAdminRecords(adminRecords);
        setMergedRecords(merged);
    }, [adminRecords]);

    const fetchData = async () => {
        setLoading(true);
        const usersData = await UserService.getAllUsers();
        // Filter out managers
        const filteredUsers = usersData.filter(user => user.role !== 'manager');
        setUsers(filteredUsers);

        // Get list of admins for filter
        const admins = usersData.filter(u => u.role === 'admin' || u.role === 'super_admin');
        setAdminList(admins);

        try {
            const data = await routineAttendanceService.getAttendanceForMonth(routine, currentYear, currentMonth);
            setAdminRecords(data.adminRecords || {});
            setMergedRecords(data.mergedRecords || {});
        } catch (error) {
            console.error("Failed to fetch attendance data from API:", error);
        }
        setLoading(false);
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    const getCurrentAttendance = () => {
        if (isSuperAdmin && selectedAdminFilter !== 'merged') {
            // Super Admin viewing specific admin's records
            return adminRecords[selectedAdminFilter] || {};
        } else if (selectedTab === 'my' && isAdmin) {
            // Admin viewing their own records
            return adminRecords[user.uid] || {};
        } else {
            // Viewing merged records
            return mergedRecords;
        }
    };

    const getAttendanceSummary = (userId) => {
        const attendance = getCurrentAttendance();
        const userAttendance = attendance[userId] || {};
        let absences = 0;
        let withNotes = 0;

        Object.keys(userAttendance).forEach(day => {
            if (userAttendance[day]?.status === 'absent') {
                absences++;
                if (userAttendance[day]?.note) {
                    withNotes++;
                }
            }
        });

        return { absences, withNotes };
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setUserModalVisible(true);
    };

    const handleDayToggle = (day) => {
        if (!selectedUser) return;

        const attendance = getCurrentAttendance();
        const cellData = attendance[selectedUser.uid]?.[day];

        // Determine if user can edit
        let canEdit = false;
        if (isSuperAdmin && selectedAdminFilter === 'merged') {
            canEdit = true; // Super Admin can edit merged view
        } else if (isAdmin && selectedTab === 'my') {
            canEdit = true; // Admin can edit their own records
        } else if (!isAdmin && cellData?.note) {
            canEdit = false; // Regular user can only view notes
        } else if (!isAdmin) {
            return; // Regular user can't open modal without note
        }

        setSelectedDay(day);
        setNoteText(cellData?.note || '');
        setIsReadOnly(!canEdit);
        setNoteModalVisible(true);
    };

    const handleSaveAttendance = async (status) => {
        if (!selectedUser || !selectedDay) return;

        const userId = selectedUser.uid;
        const adminId = user.uid;

        // Determine which record to update
        const attendanceData = {
            routine,
            year: currentYear,
            month: currentMonth + 1, // API expects 1-12
            adminId,
            userId,
            day: selectedDay,
            status,
            note: status === 'absent' ? noteText : '',
        };

        const updatedDoc = await routineAttendanceService.updateAttendance(attendanceData);

        if (updatedDoc) {
            setAdminRecords(updatedDoc.adminRecords || {});
            setMergedRecords(updatedDoc.mergedRecords || {});
        }

        setNoteModalVisible(false);
        setNoteText('');
        setSelectedDay(null);
    };

    const renderUserCard = ({ item: user }) => {
        const summary = getAttendanceSummary(user.uid);

        return (
            <TouchableOpacity
                style={styles.userCard}
                onPress={() => handleUserClick(user)}
            >
                {user.photoURL ? (
                    <Image
                        source={{ uri: user.photoURL }}
                        style={styles.profileImage}
                    />
                ) : (
                    <View style={styles.profilePlaceholder}>
                        <Text style={styles.profileInitials}>
                            {getInitials(user.personalInfo?.name || user.email)}
                        </Text>
                    </View>
                )}

                <Text style={styles.userName} numberOfLines={2}>
                    {user.personalInfo?.name || user.email}
                </Text>

                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>ຂາດເດືອນນີ້:</Text>
                        <Text style={[styles.summaryValue, summary.absences > 0 && styles.summaryValueRed]}>
                            {summary.absences} ຄັ້ງ
                        </Text>
                    </View>
                    {summary.withNotes > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>📝 ມີໝາຍເຫດ:</Text>
                            <Text style={styles.summaryValue}>{summary.withNotes} ຄັ້ງ</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ກິດຈະວັດ {routine} - ເຊັກຊື່</Text>
                <Text style={styles.headerSubtitle}>
                    {laoMonths[currentMonth]} {currentYear}
                </Text>
            </View>

            {/* Tab Bar for Admin (not Super Admin) */}
            {isAdmin && !isSuperAdmin && (
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'my' && styles.activeTab]}
                        onPress={() => setSelectedTab('my')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'my' && styles.activeTabText]}>
                            ການໝາຍຂອງຂ້ອຍ
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'merged' && styles.activeTab]}
                        onPress={() => setSelectedTab('merged')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'merged' && styles.activeTabText]}>
                            ການໝາຍລວມ
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Admin Filter for Super Admin */}
            {isSuperAdmin && (
                <View style={styles.filterContainer}>
                    <Text style={styles.filterLabel}>ເບິ່ງຂໍ້ມູນ:</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={selectedAdminFilter}
                            onValueChange={(value) => setSelectedAdminFilter(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="ການໝາຍລວມ" value="merged" />
                            {adminList.map(admin => (
                                <Picker.Item
                                    key={admin.uid}
                                    label={admin.personalInfo?.name || admin.email}
                                    value={admin.uid}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>
            )}

            <FlatList
                data={users}
                renderItem={renderUserCard}
                keyExtractor={(item) => item.uid}
                numColumns={3}
                contentContainerStyle={styles.gridContainer}
                columnWrapperStyle={styles.row}
            />

            {/* User Modal */}
            <Modal
                visible={userModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setUserModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.userModalContent}>
                        <View style={styles.userModalHeader}>
                            {selectedUser?.photoURL ? (
                                <Image
                                    source={{ uri: selectedUser.photoURL }}
                                    style={styles.modalProfileImage}
                                />
                            ) : (
                                <View style={styles.modalAvatarLarge}>
                                    <Text style={styles.modalAvatarText}>
                                        {selectedUser && getInitials(selectedUser.personalInfo?.name || selectedUser.email)}
                                    </Text>
                                </View>
                            )}
                            <Text style={styles.userModalTitle}>
                                {selectedUser?.personalInfo?.name || selectedUser?.email}
                            </Text>
                            <Text style={styles.userModalSubtitle}>
                                ກິດຈະວັດ {routine} - {laoMonths[currentMonth]}
                            </Text>
                        </View>

                        <ScrollView style={styles.daysContainer} contentContainerStyle={styles.daysScrollContent}>
                            <View style={styles.daysGrid}>
                                {days.map(day => {
                                    const attendance = getCurrentAttendance();
                                    const cellData = selectedUser && attendance[selectedUser.uid]?.[day];
                                    const isAbsent = cellData?.status === 'absent';
                                    const hasNote = cellData?.note;

                                    return (
                                        <TouchableOpacity
                                            key={day}
                                            style={[styles.dayButton, isAbsent && styles.dayButtonAbsent]}
                                            onPress={() => handleDayToggle(day)}
                                        >
                                            <Text style={[styles.dayNumber, isAbsent && styles.dayNumberAbsent]}>
                                                {day}
                                            </Text>
                                            {isAbsent && (
                                                <Text style={styles.dayStatus}>✗</Text>
                                            )}
                                            {hasNote && (
                                                <Text style={styles.dayNote}>📝</Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setUserModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>ປິດ</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Note Modal */}
            <Modal
                visible={noteModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setNoteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.noteModalContent}>
                        <Text style={styles.noteModalTitle}>
                            {isReadOnly ? 'ໝາຍເຫດ' : 'ເຊັກຊື່'}ວັນທີ {selectedDay} - {selectedUser?.personalInfo?.name || selectedUser?.email}
                        </Text>

                        <Text style={styles.noteModalLabel}>ໝາຍເຫດ{isReadOnly ? ':' : ' (ຖ້າມີ):'}</Text>
                        <TextInput
                            style={[styles.noteInput, isReadOnly && styles.noteInputReadOnly]}
                            placeholder={isReadOnly ? 'ບໍ່ມີໝາຍເຫດ' : 'ເຊັ່ນ: ລາປ່ວຍ, ຕິດທຸລະ, ລາກິດ'}
                            value={noteText}
                            onChangeText={setNoteText}
                            multiline
                            numberOfLines={3}
                            editable={!isReadOnly}
                        />

                        {isReadOnly ? (
                            <TouchableOpacity
                                style={[styles.noteModalButton, styles.closeOnlyButton]}
                                onPress={() => {
                                    setNoteModalVisible(false);
                                    setNoteText('');
                                }}
                            >
                                <Text style={[styles.noteButtonText, styles.noteButtonTextWhite]}>ປິດ</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.noteModalButtons}>
                                <TouchableOpacity
                                    style={[styles.noteModalButton, styles.cancelButton]}
                                    onPress={() => {
                                        setNoteModalVisible(false);
                                        setNoteText('');
                                    }}
                                >
                                    <Text style={styles.noteButtonText}>ຍົກເລີກ</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.noteModalButton, styles.presentButton]}
                                    onPress={() => handleSaveAttendance('present')}
                                >
                                    <Text style={[styles.noteButtonText, styles.noteButtonTextWhite]}>ມາ</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.noteModalButton, styles.absentButton]}
                                    onPress={() => handleSaveAttendance('absent')}
                                >
                                    <Text style={[styles.noteButtonText, styles.noteButtonTextWhite]}>ຂາດ</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: COLORS.primary,
        padding: 20,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.secondary,
        opacity: 0.9,
        marginTop: 5,
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
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text,
        marginRight: 10,
    },
    pickerWrapper: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    gridContainer: {
        padding: 10,
    },
    row: {
        justifyContent: 'space-between',
    },
    userCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        margin: 5,
        width: '31%',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    profilePlaceholder: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    profileInitials: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    userName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 8,
        minHeight: 32,
    },
    summaryContainer: {
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 10,
        color: '#666',
    },
    summaryValue: {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    summaryValueRed: {
        color: '#d32f2f',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userModalContent: {
        backgroundColor: '#fff',
        borderRadius: 15,
        width: '90%',
        maxWidth: 420,
        maxHeight: '85%',
    },
    userModalHeader: {
        backgroundColor: COLORS.primary,
        padding: 20,
        alignItems: 'center',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    modalProfileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
        borderWidth: 3,
        borderColor: COLORS.goldLight,
    },
    modalAvatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 3,
        borderColor: COLORS.goldLight,
    },
    modalAvatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    userModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: 5,
    },
    userModalSubtitle: {
        fontSize: 14,
        color: COLORS.secondary,
        opacity: 0.9,
    },
    daysContainer: {
        maxHeight: 450,
    },
    daysScrollContent: {
        padding: 15,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    dayButton: {
        width: '13%',
        aspectRatio: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        position: 'relative',
    },
    dayButtonAbsent: {
        backgroundColor: '#ffebee',
        borderColor: '#d32f2f',
    },
    dayNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    dayNumberAbsent: {
        color: '#d32f2f',
    },
    dayStatus: {
        position: 'absolute',
        top: 2,
        right: 2,
        fontSize: 10,
        color: '#d32f2f',
    },
    dayNote: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        fontSize: 8,
    },
    closeButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        alignItems: 'center',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    closeButtonText: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    noteModalContent: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        width: '85%',
        maxWidth: 400,
    },
    noteModalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 15,
        textAlign: 'center',
    },
    noteModalLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    noteInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    noteInputReadOnly: {
        backgroundColor: '#f5f5f5',
        color: '#666',
    },
    noteModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    noteModalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 3,
    },
    closeOnlyButton: {
        backgroundColor: COLORS.primary,
        marginHorizontal: 0,
    },
    cancelButton: {
        backgroundColor: '#e0e0e0',
    },
    presentButton: {
        backgroundColor: '#4caf50',
    },
    absentButton: {
        backgroundColor: '#d32f2f',
    },
    noteButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },
    noteButtonTextWhite: {
        color: '#fff',
    },
});

export default RoutineAttendanceScreen;

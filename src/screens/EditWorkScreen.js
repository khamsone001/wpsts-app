import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES } from '../constants/theme';
import { WorkService } from '../services/workService';
import { UserService } from '../services/userService';
import { selectPersonnelAuto } from '../utils/selectionLogic';

const EditWorkScreen = ({ route, navigation }) => {
    const { workId, work } = route.params;

    const [title, setTitle] = useState(work.title || '');
    const [location, setLocation] = useState(work.location || '');
    const [startDate, setStartDate] = useState(parseDate(work.startDate));
    const [startTime, setStartTime] = useState(parseTime(work.startTime));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState(work.selectedUsers || []);
    const [selectionMode, setSelectionMode] = useState('manual'); // Default to manual
    const [allUsers, setAllUsers] = useState([]);
    const [classFilter, setClassFilter] = useState('M');
    const [countM, setCountM] = useState('');
    const [countN, setCountN] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            const users = await UserService.getAllUsers();
            setAllUsers(users); // Include all users, including managers
        };
        fetchUsers();
    }, []);

    function parseDate(dateStr) {
        if (dateStr && dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return new Date();
    }

    function parseTime(timeStr) {
        if (timeStr && timeStr.includes(':')) {
            const [hours, minutes] = timeStr.split(':');
            const date = new Date();
            date.setHours(parseInt(hours));
            date.setMinutes(parseInt(minutes));
            return date;
        }
        return new Date();
    }

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const onTimeChange = (event, selectedTime) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            setStartTime(selectedTime);
        }
    };

        const handleAutoSelect = () => {
        const m = parseInt(countM) || 0;
        const n = parseInt(countN) || 0;

        if (m === 0 && n === 0) {
            Alert.alert('ຜິດພາດ', 'ກະລຸນາໃສ່ຈຳນວນພຣະ/ເນນທີ່ຕ້ອງການ');
            return;
        }

        if (allUsers.length === 0) {
            Alert.alert('ຜິດພາດ', 'ບໍ່ພົບຂໍ້ມູນໃນລະບົບ');
            return;
        }

        const { selected } = selectPersonnelAuto(allUsers, m, n);
        setSelectedUsers(selected);
        Alert.alert('ສຳເລັດ', `ເລືອກໄດ້ ${selected.length} ອົງ/ຮູບ`);
    };

    const handleUpdateWork = async () => {
        if (!title || !location || selectedUsers.length === 0) {
            Alert.alert('ຜິດພາດ', 'ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບຖ້ວນ ແລະ ເລືອກພຣະ/ເນນ');
            return;
        }

        const workData = {
            title,
            location,
            startDate: formatDate(startDate),
            startTime: formatTime(startTime),
            selectedUsers
        };

        const result = await WorkService.updateWork(workId, workData);
        if (result.success) {
            Alert.alert('ສຳເລັດ', 'ອັບເດດກິດນິມົນສຳເລັດ!');
            navigation.goBack();
        } else {
            Alert.alert('ຜິດພາດ', 'ບໍ່ສາມາດອັບເດດກິດນິມົນໄດ້: ' + result.error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>ແກ້ໄຂກິດນິມົນ</Text>

                <Text style={styles.label}>ຫົວຂໍ້ກິດນິມົນ</Text>
                <TextInput
                    style={styles.input}
                    placeholder="ຕົວຢ່າງ: ກິດນິມົນ..."
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={styles.label}>ສະຖານທີ່</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Location"
                    value={location}
                    onChangeText={setLocation}
                />

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ວັນທີເລີ່ມ</Text>
                        <TouchableOpacity
                            style={styles.dateTimeButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateTimeText}>{formatDate(startDate)}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                            />
                        )}
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ເວລາເລີ່ມ</Text>
                        <TouchableOpacity
                            style={styles.dateTimeButton}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text style={styles.dateTimeText}>{formatTime(startTime)}</Text>
                        </TouchableOpacity>
                        {showTimePicker && (
                            <DateTimePicker
                                value={startTime}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onTimeChange}
                            />
                        )}
                    </View>
                </View>

                <Text style={styles.sectionHeader}>ເລືອກພຣະ/ເນນ</Text>

                <View style={styles.modeSelector}>
                    <TouchableOpacity
                        style={[styles.modeButton, selectionMode === 'manual' && styles.modeButtonActive]}
                        onPress={() => setSelectionMode('manual')}
                    >
                        <Text style={[styles.modeText, selectionMode === 'manual' && styles.modeTextActive]}>ເລືອກເອງ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modeButton, selectionMode === 'auto' && styles.modeButtonActive]}
                        onPress={() => setSelectionMode('auto')}
                    >
                        <Text style={[styles.modeText, selectionMode === 'auto' && styles.modeTextActive]}>ເລືອກຕາມລຳດັບ</Text>
                    </TouchableOpacity>
                </View>

                {selectionMode === 'auto' ? (
                    <View>
                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>ຈຳນວນ ພຣະ</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    value={countM}
                                    onChangeText={setCountM}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>ຈຳນວນ ຈົວ</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    value={countN}
                                    onChangeText={setCountN}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                        <TouchableOpacity style={styles.actionButton} onPress={handleAutoSelect}>
                            <Text style={styles.actionButtonText}>ເລືອກຕາມລຳດັບ ແບບອັດຕະໂນມັດ</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.manualContainer}>
                        <Text style={styles.subLabel}>ເລືອກພຣະ/ເນນດ້ວຍຕົນເອງ:</Text>

                        <View style={styles.classFilterContainer}>
                            <TouchableOpacity
                                style={[styles.classFilterButton, classFilter === 'M' && styles.classFilterActive]}
                                onPress={() => setClassFilter('M')}
                            >
                                <Text style={[styles.classFilterText, classFilter === 'M' && styles.classFilterTextActive]}>ພຣະ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.classFilterButton, classFilter === 'N' && styles.classFilterActive]}
                                onPress={() => setClassFilter('N')}
                            >
                                <Text style={[styles.classFilterText, classFilter === 'N' && styles.classFilterTextActive]}>ຈົວ</Text>
                            </TouchableOpacity>
                        </View>

                        {allUsers.filter(u => u.personalInfo?.class === classFilter).map(u => {
                            const isSelected = selectedUsers.find(sel => sel.uid === u.uid);
                            return (
                                <TouchableOpacity
                                    key={u.uid}
                                    style={[styles.userSelectable, isSelected && styles.userSelected]}
                                    onPress={() => {
                                        if (isSelected) {
                                            setSelectedUsers(prev => prev.filter(p => p.uid !== u.uid));
                                        } else {
                                            setSelectedUsers(prev => [...prev, u]);
                                        }
                                    }}
                                >
                                    <Text style={[styles.userName, isSelected && styles.textSelected]}>{u.personalInfo?.name || u.email}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {selectedUsers.length > 0 && (
                    <View style={styles.listContainer}>
                        <Text style={styles.label}>ພຣະ/ເນນທີ່ຖືກເລືອກ ({selectedUsers.length})</Text>
                        {selectedUsers.map(u => (
                            <View key={u.uid} style={styles.userItem}>
                                <Text style={styles.userName}>{u.personalInfo?.name || u.email}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity style={styles.updateButton} onPress={handleUpdateWork}>
                    <Text style={styles.updateButtonText}>ບັນທຶກການແກ້ໄຂ</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>ຍົກເລີກ</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: SIZES.padding,
        backgroundColor: COLORS.background,
    },
    card: {
        backgroundColor: COLORS.secondary,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        elevation: 3,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius,
        padding: 10,
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    dateTimeButton: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    dateTimeText: {
        fontSize: 16,
        color: COLORS.text,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: 10,
        marginBottom: 10,
    },
    modeSelector: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    modeButton: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignItems: 'center',
    },
    modeButtonActive: {
        backgroundColor: COLORS.primary,
    },
    modeText: {
        color: COLORS.primary,
    },
    modeTextActive: {
        color: COLORS.secondary,
    },
    actionButton: {
        backgroundColor: COLORS.goldLight,
        padding: 10,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginBottom: 15,
    },
    actionButtonText: {
        color: COLORS.text,
        fontWeight: 'bold',
    },
    manualContainer: {
        marginBottom: 15,
    },
    subLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        color: COLORS.text,
    },
    classFilterContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        gap: 10,
    },
    classFilterButton: {
        flex: 1,
        padding: 12,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    classFilterActive: {
        backgroundColor: COLORS.primary,
    },
    classFilterText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    classFilterTextActive: {
        color: COLORS.secondary,
    },
    userSelectable: {
        padding: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius,
        marginBottom: 5,
        backgroundColor: '#fff',
    },
    userSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    textSelected: {
        color: COLORS.secondary,
    },
    listContainer: {
        marginTop: 10,
        marginBottom: 20,
        maxHeight: 200,
    },
    userItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    userName: {
        fontWeight: 'bold',
        color: COLORS.text,
    },
    userDetails: {
        fontSize: 12,
        color: '#666',
    },
    updateButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginTop: 10,
    },
    updateButtonText: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#999',
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditWorkScreen;

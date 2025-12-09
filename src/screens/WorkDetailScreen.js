import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { WorkService } from '../services/workService';
import { useAuth } from '../context/AuthContext';
import * as Clipboard from 'expo-clipboard';

const WORK_STATUSES = [
    { value: 'Pending', label: 'ລໍດຳເນີນການ' },
    { value: 'In Progress', label: 'ກຳລັງດຳເນີນການ' },
    { value: 'Completed', label: 'ສຳເລັດ' },
    { value: 'Cancelled', label: 'ຍົກເລີກ' },
];

const WorkDetailScreen = ({ route, navigation }) => {
    const { workId } = route.params;
    const { userRole } = useAuth();
    const [work, setWork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        fetchWork();
    }, []);

    useEffect(() => {
        if (work) {
            setSelectedStatus(work.status);
        }
    }, [work]);

    const fetchWork = async () => {
        const data = await WorkService.getWorkById(workId);
        setWork(data);
        setLoading(false);
    };

    const handleStatusChange = async (newStatus) => {
        setSelectedStatus(newStatus);
        const result = await WorkService.updateWorkStatus(workId, newStatus);
        if (result.success) {
            Alert.alert('ສຳເລັດ', 'ອັບເດດສະຖານະສຳເລັດ');
            fetchWork();
        } else {
            Alert.alert('ຜິດພາດ', 'ບໍ່ສາມາດອັບເດດສະຖານະໄດ້: ' + result.error);
            setSelectedStatus(work.status);
        }
    };

    const handleEdit = () => {
        navigation.navigate('EditWork', { workId, work });
    };

    const handleCopy = async () => {
        if (!work) return;

        const statusLabel = WORK_STATUSES.find(s => s.value === work.status)?.label || work.status;
        const userList = work.selectedUsers?.map(u => `- ${u.personalInfo?.name || u.email}`).join('\n') || 'ບໍ່ມີ';

        const contentToCopy = `
ຫົວຂໍ້: ${work.title}
ສະຖານທີ່: ${work.location}
ເວລາ: ${work.startTime} ວັນທີ: ${work.startDate}

ອົງໄປກິດນິມົນ: (${work.selectedUsers?.length || 0} ອົງ):
${userList}
        `.trim();

        await Clipboard.setStringAsync(contentToCopy);
        Alert.alert('ສຳເລັດ', 'ຄັດລອກຂໍ້ມູນກິດນິມົນໃສ່ຄລິບບອດແລ້ວ');
    };


    const handleDelete = () => {
        Alert.alert(
            'ລຶບກິດນິມົນ',
            'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບກິດນິມົນນີ້? ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.',
            [
                { text: 'ຍົກເລີກ', style: 'cancel' },
                {
                    text: 'ລຶບ',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await WorkService.deleteWork(workId);
                        if (result.success) {
                            Alert.alert('ສຳເລັດ', 'ລຶບກິດນິມົນສຳເລັດ');
                            navigation.goBack();
                        } else {
                            Alert.alert('ຜິດພາດ', 'ບໍ່ສາມາດລຶບກິດນິມົນໄດ້: ' + result.error);
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    if (!work) return <View style={styles.center}><Text>ບໍ່ພົບຂໍ້ມູນກິດນິມົນ</Text></View>;

    const canManageWork = ['super_admin', 'admin', 'manager'].includes(userRole);
    const canEditStatus = canManageWork;
    const canEditWork = canManageWork;
    const canDeleteWork = userRole === 'super_admin' && (work.status === 'Completed' || work.status === 'Cancelled');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{work.title}</Text>
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                            <Text style={styles.editButtonText}>📋</Text>
                        </TouchableOpacity>
                        {canEditWork && (
                            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                                <Text style={styles.editButtonText}>✏️</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {canEditStatus ? (
                    <View style={styles.statusSection}>
                        <Text style={styles.statusLabel}>ສະຖານະ:</Text>
                        <View style={styles.statusSelector}>
                            {WORK_STATUSES.map(status => (
                                <TouchableOpacity
                                    key={status.value}
                                    style={[
                                        styles.statusOption,
                                        selectedStatus === status.value && styles.statusOptionActive
                                    ]}
                                    onPress={() => handleStatusChange(status.value)}
                                >
                                    <Text style={[
                                        styles.statusOptionText,
                                        selectedStatus === status.value && styles.statusOptionTextActive
                                    ]}>
                                        {status.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{WORK_STATUSES.find(s => s.value === work.status)?.label || work.status}</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.label}>ສະຖານທີ່:</Text>
                    <Text style={styles.value}>{work.location}</Text>
                </View>

                <View style={styles.row}>
                    <View style={styles.half}>
                        <Text style={styles.label}>ວັນທີເລີ່ມ:</Text>
                        <Text style={styles.value}>{work.startDate}</Text>
                    </View>
                    <View style={styles.half}>
                        <Text style={styles.label}>ເວລາເລີ່ມ:</Text>
                        <Text style={styles.value}>{work.startTime}</Text>
                    </View>
                </View>
                <Text style={styles.sectionHeader}>ອົງໄປກິດນິມົນ: ({work.selectedUsers?.length || 0})</Text>
                {work.selectedUsers?.map((u, index) => (
                    <View key={index} style={styles.userItem}>
                        <Text style={styles.userName}>{u.personalInfo?.name || u.email}</Text>
                    </View>
                ))}

                {canDeleteWork && (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Text style={styles.deleteButtonText}>🗑 ລຶບກິດນິມົນ</Text>
                    </TouchableOpacity>
                )}
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: COLORS.secondary,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        flex: 1,
    },
    copyButton: {
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: SIZES.radius,
    },
    editButton: {
        backgroundColor: COLORS.goldLight,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: SIZES.radius,
        marginLeft: 'auto',
    },
    editButtonText: {
        color: COLORS.text,
        fontWeight: 'bold',
        fontSize: 14,
    },
    statusSection: {
        marginBottom: 20,
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    statusSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: SIZES.radius,
        backgroundColor: '#fff',
        minWidth: '45%',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusOptionActive: {
        backgroundColor: COLORS.primary,
    },
    statusOptionText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    statusOptionTextActive: {
        color: COLORS.secondary,
    },
    badge: {
        backgroundColor: COLORS.goldLight,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    badgeText: {
        color: COLORS.text,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    half: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: 10,
        marginBottom: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    userItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#f9f9f9',
        marginBottom: 5,
        borderRadius: 5,
    },
    userName: {
        fontWeight: 'bold',
        color: COLORS.text,
    },
    userDetails: {
        fontSize: 12,
        color: '#666',
    },
    deleteButton: {
        backgroundColor: '#f44336',
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginTop: 20,
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default WorkDetailScreen;

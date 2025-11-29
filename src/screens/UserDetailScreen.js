import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { UserService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const UserDetailScreen = ({ route, navigation }) => {
    const { uid } = route.params;
    const { user, userRole, updateUserProfile: updateAuthContext } = useAuth(); // Get current user and context updater
    const [userProfile, setUserProfile] = useState(null);
    const [skillLevel, setSkillLevel] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState('');
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        // Add a check to ensure uid is valid before fetching
        if (!uid) return;
        const data = await UserService.getUserProfile(uid);
        setUserProfile(data);
        setSkillLevel(data?.workInfo?.skillLevel?.toString() || '0');
        setSelectedRole(data?.role || 'user');
        setLoading(false);
    };

    const handleUpdateSkill = async () => {
        const level = parseInt(skillLevel);
        if (isNaN(level) || level < 0 || level > 100) {
            Alert.alert('ຜິດພາດ', 'ລະດັບຄວາມສາມາດຕ້ອງຢູ່ລະຫວ່າງ 0 ຫາ 100');
            return;
        }

        const result = await UserService.updateUserSkill(uid, level);
        if (result.success) {
            Alert.alert('ສຳເລັດ', 'ອັບເດດລະດັບຄວາມສາມາດສຳເລັດ');
            fetchUser();
        } else {
            Alert.alert('ຜິດພາດ', 'ບໍ່ສາມາດອັບເດດລະດັບຄວາມສາມາດໄດ້');
        }
    };

    const handleUpdateRole = async (role) => {
        const result = await UserService.updateUserRole(uid, role);
        if (result.success) {
            Alert.alert('ສຳເລັດ', `ອັບເດດຕຳແໜ່ງເປັນ ${role} ສຳເລັດ`);
            setSelectedRole(role);
            setShowRoleModal(false);
            fetchUser();
        } else {
            Alert.alert('ຜິດພາດ', 'ບໍ່ສາມາດອັບເດດຕຳແໜ່ງໄດ້');
        }
    };

    const handleUpdateClass = async (newClass) => {
        // Prevent updating if the class is already the same
        if (userProfile?.personalInfo?.class === newClass) return;

        Alert.alert(
            'ຢືນຢັນການປ່ຽນ Class',
            `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການປ່ຽນ Class ຂອງຜູ້ໃຊ້ນີ້ເປັນ Class ${newClass === 'M' ? 'ພຣະ' : 'ສ.ນ'}?`,
            [
                {
                    text: 'ຍົກເລີກ',
                    style: 'cancel',
                },
                {
                    text: 'ຢືນຢັນ',
                    onPress: async () => {
                        const result = await UserService.updateUserProfile(uid, {
                            personalInfo: { ...userProfile.personalInfo, class: newClass }
                        });
                        if (result.success) {
                            Alert.alert('ສຳເລັດ', `ປ່ຽນ Class ເປັນ ${newClass === 'M' ? 'ພຣະ' : 'ສ.ນ'} ສຳເລັດ`);
                            if (user.uid === uid) {
                                updateAuthContext({ personalInfo: { ...userProfile.personalInfo, class: newClass } });
                            }
                            fetchUser();
                        } else {
                            Alert.alert('ຜິດພາດ', 'ບໍ່ສາມາດອັບເດດ Class ໄດ້: ' + result.error);
                        }
                    },
                },
            ]
        );
    };

    const handleOpenPasswordModal = () => {
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordModal(true);
    };

    const handleSetNewPassword = async () => {
        if (!newPassword || !confirmPassword) {
            return Alert.alert('ຜິດພາດ', 'ກະລຸນາປ້ອນລະຫັດຜ່ານທັງສອງຊ່ອງ');
        }
        if (newPassword !== confirmPassword) {
            return Alert.alert('ຜິດພາດ', 'ລະຫັດຜ່ານບໍ່ກົງກັນ');
        }

        const result = await UserService.setUserPassword(uid, newPassword);
        if (result.success) {
            Alert.alert('ສຳເລັດ', 'ຕັ້ງລະຫັດຜ່ານໃໝ່ສຳເລັດ!');
            setShowPasswordModal(false);
        } else {
            Alert.alert('ຜິດພາດ', result.error || 'ບໍ່ສາມາດຕັ້ງລະຫັດຜ່ານໃໝ່ໄດ້');
        }
    };

    const handleDeleteUser = () => {
        Alert.alert(
            'ລຶບຜູ້ໃຊ້',
            `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຜູ້ໃຊ້ "${userProfile?.personalInfo?.name}"? ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.`,
            [
                { text: 'ຍົກເລີກ', style: 'cancel' },
                {
                    text: 'ລຶບ',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await UserService.deleteUser(uid);
                        if (result.success) {
                            Alert.alert('ສຳເລັດ', 'ລຶບຜູ້ໃຊ້ສຳເລັດ');
                            navigation.goBack();
                        } else {
                            Alert.alert('ຜິດພາດ', result.error || 'ບໍ່ສາມາດລຶບຜູ້ໃຊ້ໄດ້');
                        }
                    }
                }
            ]
        );
    };

    const handleApproveUser = async () => {
        Alert.alert(
            'ຢືນຢັນການອະນຸມັດ',
            `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອະນຸມັດຜູ້ໃຊ້ "${userProfile?.personalInfo?.name}"?`,
            [
                { text: 'ຍົກເລີກ', style: 'cancel' },
                {
                    text: 'ອະນຸມັດ', onPress: async () => {
                        const result = await UserService.approveUser(uid);
                        if (result.success) {
                            Alert.alert('ສຳເລັດ', 'ອະນຸມັດຜູ້ໃຊ້ສຳເລັດ!');
                            fetchUser(); // Refresh the user details
                        } else {
                            Alert.alert('ຜິດພາດ', result.error || 'ບໍ່ສາມາດອະນຸມັດຜູ້ໃຊ້ໄດ້');
                        }
                    }
                }
            ]
        )
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>ກຳລັງໂຫຼດ...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        {userProfile?.photoURL ? (
                            <Image source={{ uri: userProfile.photoURL }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>
                                {userProfile?.personalInfo?.name?.charAt(0) || 'U'}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.name}>{userProfile?.personalInfo?.name || userProfile?.email}</Text>
                    <Text style={styles.role}>{userProfile?.role?.toUpperCase()}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ຂໍ້ມູນສ່ວນຕົວ</Text>
                    {userRole === 'super_admin' && (
                        <Text style={styles.label}>ອີເມວ: {userProfile?.email}</Text>
                    )}
                    <Text style={styles.label}>Class: {userProfile?.personalInfo?.class === 'M' ? 'ພຣະ' : 'ສ.ນ'}</Text>
                    <Text style={styles.label}>ອາຍຸ: {userProfile?.personalInfo?.age || '-'}</Text>
                    <Text style={styles.label}>ການສຶກສາ: {userProfile?.personalInfo?.education || '-'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ປະຫວັດການອຸປະສົມບົດ</Text>
                    <Text style={styles.label}>ອາຍຸພັນສາ: {userProfile?.history?.workAge || 0} ປີ</Text>
                    <Text style={styles.label}>ວັນທີເຂົ້າ: {userProfile?.history?.entryDate || '-'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ທີ່ຢູ່ປັດຈຸບັນ</Text>
                    <Text style={styles.label}>
                        {userProfile?.personalInfo?.currentAddress ?
                            `${userProfile.personalInfo.currentAddress.house || ''} ${userProfile.personalInfo.currentAddress.city || ''} ${userProfile.personalInfo.currentAddress.district || ''}`
                            : '-'}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ຂໍ້ມູນຄອບຄົວ</Text>

                    <Text style={styles.subLabel}>ບິດາ</Text>
                    <Text style={styles.label}>ຊື່: {userProfile?.family?.father?.firstName} {userProfile?.family?.father?.lastName}</Text>
                    <Text style={styles.label}>ອາຍຸ: {userProfile?.family?.father?.age}</Text>

                    <Text style={styles.subLabel}>ມານດາ</Text>
                    <Text style={styles.label}>ຊື່: {userProfile?.family?.mother?.firstName} {userProfile?.family?.mother?.lastName}</Text>
                    <Text style={styles.label}>ອາຍຸ: {userProfile?.family?.mother?.age}</Text>
                </View>

                {/* Skill Level Section - Only visible to Super Admins */}
                {userRole === 'super_admin' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ການຈັດການຄວາມສາມາດ</Text>
                        <Text style={styles.label}>ລະດັບຄວາມສາມາດປັດຈຸບັນ: {userProfile?.workInfo?.skillLevel || 0}</Text>
                    </View>
                )}

                {userRole === 'super_admin' && (
                    <View style={styles.adminSection}>
                        <Text style={styles.adminTitle}>ສ່ວນຄວບຄຸມ Super Admin</Text>

                        {/* Skill Update */}
                        <View style={styles.controlGroup}>
                            <Text style={styles.subLabel}>ອັບເດດຄວາມສາມາດ (0-100):</Text>
                            <View style={styles.row}>
                                <TextInput
                                    style={styles.input}
                                    value={skillLevel}
                                    onChangeText={setSkillLevel}
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity style={styles.updateButton} onPress={handleUpdateSkill}>
                                    <Text style={styles.updateButtonText}>ອັບເດດ</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Role Update */}
                        <View style={styles.controlGroup}>
                            <Text style={styles.subLabel}>ຕຳແໜ່ງ:</Text>
                            <TouchableOpacity style={styles.roleSelector} onPress={() => setShowRoleModal(true)}>
                                <Text style={styles.roleSelectorText}>{selectedRole.toUpperCase()}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Class Update */}
                        <View style={styles.controlGroup}>
                            <Text style={styles.subLabel}>ປ່ຽນ Class:</Text>
                            <View style={styles.row}>
                                <TouchableOpacity
                                    style={[styles.classButton, userProfile?.personalInfo?.class === 'M' && styles.classButtonActive]}
                                    onPress={() => handleUpdateClass('M')}
                                >
                                    <Text style={[styles.classButtonText, userProfile?.personalInfo?.class === 'M' && styles.classButtonTextActive]}>Class ພຣະ</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.classButton, userProfile?.personalInfo?.class === 'N' && styles.classButtonActive]}
                                    onPress={() => handleUpdateClass('N')}
                                >
                                    <Text style={[styles.classButtonText, userProfile?.personalInfo?.class === 'N' && styles.classButtonTextActive]}>Class ສ.ນ</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Approval Button */}
                        {!userProfile?.isApproved && (
                            <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={handleApproveUser}>
                                <Text style={styles.approveButtonText}>✅ ອະນຸມັດຜູ້ໃຊ້ນີ້</Text>
                            </TouchableOpacity>
                        )}

                        {/* Password Reset */}
                        <TouchableOpacity style={styles.actionButton} onPress={handleOpenPasswordModal}>
                            <Text style={styles.actionButtonText}>🔑 ຕັ້ງລະຫັດຜ່ານໃໝ່</Text>
                        </TouchableOpacity>

                        {/* Delete User Button - Hide if the super admin is viewing their own profile */}
                        {user.uid !== uid && (
                            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDeleteUser}>
                                <Text style={styles.deleteButtonText}>🗑 ລຶບຜູ້ໃຊ້ນີ້</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* Role Selection Modal */}
            <Modal visible={showRoleModal} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>ເລືອກຕຳແໜ່ງ</Text>
                        {['user', 'manager', 'admin', 'super_admin'].map((role) => (
                            <TouchableOpacity
                                key={role}
                                style={styles.modalOption}
                                onPress={() => handleUpdateRole(role)}
                            >
                                <Text style={styles.modalOptionText}>{role.toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.modalCancel} onPress={() => setShowRoleModal(false)}>
                            <Text style={styles.modalCancelText}>ຍົກເລີກ</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Set Password Modal */}
            <Modal visible={showPasswordModal} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>ຕັ້ງລະຫັດຜ່ານໃໝ່</Text>
                        <Text style={styles.modalSubtitle}>สำหรับ {userProfile?.personalInfo?.name}</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="ລະຫັດຜ່ານໃໝ່"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="ຢືນຢັນລະຫັດຜ່ານໃໝ່"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setShowPasswordModal(false)}>
                                <Text style={styles.modalButtonText}>ຍົກເລີກ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalSaveButton]} onPress={handleSetNewPassword}>
                                <Text style={[styles.modalButtonText, { color: '#fff' }]}>ບັນທຶກ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
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
        backgroundColor: COLORS.background,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    card: {
        backgroundColor: COLORS.secondary,
        margin: SIZES.padding,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        elevation: 3,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarText: {
        fontSize: 30,
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    role: {
        color: COLORS.primary,
        marginTop: 5,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: COLORS.text,
    },
    adminSection: {
        marginTop: 10,
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    adminTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#d32f2f',
        marginBottom: 15,
        textAlign: 'center',
    },
    controlGroup: {
        marginBottom: 15,
    },
    subLabel: {
        fontSize: 14,
        marginBottom: 5,
        fontWeight: 'bold',
        color: '#555',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius,
        padding: 10,
        width: 80,
        marginRight: 10,
        backgroundColor: '#fff',
    },
    updateButton: {
        backgroundColor: COLORS.primary,
        padding: 10,
        borderRadius: SIZES.radius,
    },
    updateButtonText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    roleSelector: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    roleSelectorText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    classButton: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    classButtonActive: {
        backgroundColor: COLORS.primary,
    },
    classButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    classButtonTextActive: {
        color: COLORS.secondary,
    },
    actionButton: {
        backgroundColor: COLORS.secondary,
        padding: 12,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    actionButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    approveButton: {
        backgroundColor: '#e8f5e9',
        borderColor: '#4caf50',
        marginTop: 10,
    },
    approveButtonText: {
        color: '#4caf50',
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: '#ffebee',
        borderColor: '#d32f2f',
        marginTop: 10,
    },
    deleteButtonText: {
        color: '#d32f2f',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '80%',
        padding: 20,
        borderRadius: SIZES.radius,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalOptionText: {
        fontSize: 16,
        textAlign: 'center',
    },
    modalCancel: {
        marginTop: 15,
        padding: 10,
        alignItems: 'center',
    },
    modalCancelText: {
        color: 'red',
        fontWeight: 'bold',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        fontSize: 16,
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCancelButton: {
        backgroundColor: '#e0e0e0',
    },
    modalSaveButton: {
        backgroundColor: COLORS.primary,
    },
    modalButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default UserDetailScreen;

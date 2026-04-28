import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert, ScrollView, Modal, TextInput } from 'react-native';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants/theme';
import { uploadImageAsync } from '../services/uploadService';
import { UserService } from '../services/userService';
import { Feather } from '@expo/vector-icons';

const ProfileScreen = () => {
    const { user, userRole, logout, updateUserProfile } = useAuth();
    const navigation = useNavigation();

    const [imageUri, setImageUri] = useState(user?.photo_url || user?.photoURL || null);
    const [hasNewImage, setHasNewImage] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);

    // Password change states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    useEffect(() => {
        if (user?.photo_url || user?.photoURL) {
            setImageUri(user.photo_url || user.photoURL);
        }
    }, [user]);

    const pickImage = async () => {
        try {
            const result = await launchImageLibraryAsync({
                mediaTypes: 'Images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });
            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
                setHasNewImage(true);
            }
        } catch (e) {
            console.log('Image picker error', e);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleSaveProfile = async () => {
        if (hasNewImage && imageUri) {
            try {
                const uploadResult = await uploadImageAsync(imageUri);
                const newPhotoURL = uploadResult.url;

                const result = await updateUserProfile({ photo_url: newPhotoURL });

                if (result.success) {
                    setHasNewImage(false);
                    Alert.alert('ສຳເລັດ', 'ອັບເດດຮູບໂປຣໄຟລ໌ສຳເລັດ!');
                } else {
                    Alert.alert('ຜິດພາດ', result.error || 'ບໍ່ສາມາດອັບເດດໂປຣໄຟລ໌ໄດ້');
                }
            } catch (error) {
                console.error("Upload Error on ProfileScreen:", error);
                Alert.alert('ຜິດພາດ', 'ບໍ່ສາມາດອັບໂຫຼດຮູບໄດ້: ' + error.message);
            }
        }
    };

    const handleOpenPasswordModal = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPasswordModalVisible(true);
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return Alert.alert('ຜິດພາດ', 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ');
        }
        if (newPassword !== confirmNewPassword) {
            return Alert.alert('ຜິດພາດ', 'ລະຫັດຜ່ານໃໝ່ບໍ່ກົງກັນ');
        }
        if (newPassword.length < 6) {
            return Alert.alert('ຜິດພາດ', 'ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ');
        }

        const result = await UserService.changePassword(currentPassword, newPassword);
        if (result.success) {
            Alert.alert('ສຳເລັດ', 'ປ່ຽນລະຫັດຜ່ານສຳເລັດ!');
            setPasswordModalVisible(false);
        } else {
            Alert.alert('ຜິດພາດ', result.error || 'ບໍ່ສາມາດປ່ຽນລະຫັດຜ່ານໄດ້');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('lo-LA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatAddress = (location) => {
        if (!location) return '-';
        const parts = [];
        if (location.house) parts.push(`ບ້ານ: ${location.house}`);
        if (location.city) parts.push(`ເມືອງ: ${location.city}`);
        if (location.district) parts.push(`ແຂວງ: ${location.district}`);
        return parts.join(' ') || '-';
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{(user?.first_name || user?.personalInfo?.firstName || 'U').charAt(0)}</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage}>
                        <Text style={styles.changePhotoText}>📷</Text>
                    </TouchableOpacity>
                </View>
                {hasNewImage && (
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                        <Text style={styles.saveButtonText}>ບັນທຶກຮູບພາບ</Text>
                    </TouchableOpacity>
                )}
                <Text style={styles.name}>
                    {user?.personalInfo?.firstName} {user?.personalInfo?.lastName}
                </Text>
                <Text style={styles.nickname}>({user?.personalInfo?.nickname || '-'})</Text>
                <Text style={styles.role}>{userRole?.toUpperCase()} - Class {user?.personalInfo?.class === 'M' ? 'ພຣະ' : 'ສ.ນ'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ຂໍ້ມູນທົ່ວໄປ</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{user?.email}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ອາຍຸ:</Text>
                    <Text style={styles.value}>{user?.personalInfo?.age || '-'} ປີ</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ອາຍຸວັດສາ:</Text>
                    <Text style={styles.value}>{user?.history?.workAge || '-'} ປີ</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ທີ່ຢູ່ປັດຈຸບັນ:</Text>
                    <Text style={styles.value}>{formatAddress(user?.personalInfo?.currentAddress)}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ປະຫວັດສ່ວນຕົວ</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ວັນເກີດ:</Text>
                    <Text style={styles.value}>{formatDate(user?.history?.birthDate)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ສະຖານທີ່ເກີດ:</Text>
                    <Text style={styles.value}>{formatAddress(user?.history?.placeOfBirth)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ເຊື້ອຊາດ:</Text>
                    <Text style={styles.value}>{user?.history?.race || '-'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ສັນຊາດ:</Text>
                    <Text style={styles.value}>{user?.history?.nationality || '-'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ຊົນເຜົ່າ:</Text>
                    <Text style={styles.value}>{user?.history?.tribe || '-'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ການສຶກສາ:</Text>
                    <Text style={styles.value}>{user?.history?.education || '-'}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ຂໍ້ມູນຄອບຄົວ</Text>

                <Text style={styles.subHeader}>ບິດາ (Father)</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ຊື່ ແລະ ນາມສະກຸນ:</Text>
                    <Text style={styles.value}>{user?.family?.father?.firstName} {user?.family?.father?.lastName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ອາຍຸ:</Text>
                    <Text style={styles.value}>{user?.family?.father?.age || '-'} ປີ</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ສະຖານທີ່ເກີດ:</Text>
                    <Text style={styles.value}>{formatAddress(user?.family?.father?.placeOfBirth)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ທີ່ຢູ່ປັດຈຸບັນ:</Text>
                    <Text style={styles.value}>{formatAddress(user?.family?.father?.currentAddress)}</Text>
                </View>

                <Text style={styles.subHeader}>ມານດາ (Mother)</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ຊື່ ແລະ ນາມສະກຸນ:</Text>
                    <Text style={styles.value}>{user?.family?.mother?.firstName} {user?.family?.mother?.lastName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ອາຍຸ:</Text>
                    <Text style={styles.value}>{user?.family?.mother?.age || '-'} ປີ</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ສະຖານທີ່ເກີດ:</Text>
                    <Text style={styles.value}>{formatAddress(user?.family?.mother?.placeOfBirth)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ທີ່ຢູ່ປັດຈຸບັນ:</Text>
                    <Text style={styles.value}>{formatAddress(user?.family?.mother?.currentAddress)}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ບັນພະຊາເປັນສຳມະເນນ</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ບວດເມື່ອວັນທີ່:</Text>
                    <Text style={styles.value}>{formatDate(user?.history?.classN?.entryDate)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ສະຖານທີ່:</Text>
                    <Text style={styles.value}>{formatAddress(user?.history?.classN?.location)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ພຣະອຸປະຊາ:</Text>
                    <Text style={styles.value}>{user?.history?.classN?.issuerName || '-'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ປຶ້ມສຸດທິ:</Text>
                    <Text style={styles.value}>{user?.history?.classN?.idCard || '-'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>ອາຍຸພັນສາລວມ:</Text>
                    <Text style={styles.value}>{user?.history?.classN?.totalWorkAge || '-'} ປີ</Text>
                </View>
            </View>

            {user?.personalInfo?.class === 'M' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ບັນພະຊາເປັນພະພິກຂຸ</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>ບວດເມື່ອວັນທີ່:</Text>
                        <Text style={styles.value}>{formatDate(user?.history?.classM?.entryDate)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>ສະຖານທີ່:</Text>
                        <Text style={styles.value}>{formatAddress(user?.history?.classM?.location)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>ພຣະອຸປະຊາ:</Text>
                        <Text style={styles.value}>{user?.history?.classM?.issuerName || '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>ປຶ້ມສຸດທິ:</Text>
                        <Text style={styles.value}>{user?.history?.classM?.idCard || '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>ອາຍຸພັນສາລວມ:</Text>
                        <Text style={styles.value}>{user?.history?.classM?.totalWorkAge || '-'} ປີ</Text>
                    </View>
                </View>
            )}

            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
                <Text style={styles.editButtonText}>ແກ້ໄຂຂໍ້ມູນສ່ວນຕົວ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.changePasswordButton} onPress={handleOpenPasswordModal}>
                <Text style={styles.changePasswordButtonText}>🔑 ປ່ຽນລະຫັດຜ່ານ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutText}>ອອກຈາກລະບົບ</Text>
            </TouchableOpacity>

            <View style={{ height: 50 }} />

            {/* Change Password Modal */}
            <Modal visible={passwordModalVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>ປ່ຽນລະຫັດຜ່ານ</Text>

                        <Text style={styles.modalLabel}>ລະຫັດຜ່ານປັດຈຸບັນ</Text>
                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={styles.modalInput}
                                secureTextEntry={!showCurrentPassword}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                            />
                            <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.eyeIcon}>
                                <Feather name={showCurrentPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>ລະຫັດຜ່ານໃໝ່</Text>
                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={styles.modalInput}
                                secureTextEntry={!showNewPassword}
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
                                <Feather name={showNewPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>ຢືນຢັນລະຫັດຜ່ານໃໝ່</Text>
                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={styles.modalInput}
                                secureTextEntry={!showConfirmNewPassword}
                                value={confirmNewPassword}
                                onChangeText={setConfirmNewPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)} style={styles.eyeIcon}>
                                <Feather name={showConfirmNewPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setPasswordModalVisible(false)}>
                                <Text style={styles.modalButtonText}>ຍົກເລີກ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalSaveButton]} onPress={handleChangePassword}>
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
        padding: SIZES.padding,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
        backgroundColor: COLORS.secondary,
        padding: 20,
        borderRadius: SIZES.radius,
        elevation: 2,
    },
    avatarContainer: {
        position: 'relative',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarText: {
        fontSize: 30,
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    changePhotoBtn: {
        position: 'absolute',
        right: -5,
        bottom: -5,
        backgroundColor: COLORS.goldLight,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    changePhotoText: {
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 10,
        marginTop: 5,
    },
    saveButtonText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 10,
    },
    nickname: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    role: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    section: {
        backgroundColor: COLORS.secondary,
        padding: 15,
        borderRadius: SIZES.radius,
        marginBottom: 15,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    label: {
        width: 100,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    value: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
        fontWeight: 'bold',
    },
    editButton: {
        backgroundColor: COLORS.goldLight,
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginBottom: 10,
    },
    editButtonText: {
        color: COLORS.text,
        fontWeight: 'bold',
        fontSize: 16,
    },
    changePasswordButton: {
        backgroundColor: COLORS.secondary,
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    changePasswordButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    logoutButton: {
        backgroundColor: '#ff4444',
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '90%',
        padding: 20,
        borderRadius: SIZES.radius,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: COLORS.primary,
    },
    modalLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 15,
    },
    modalInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
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

export default ProfileScreen;

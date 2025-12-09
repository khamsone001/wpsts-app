import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import routineService from '../services/routineService';

const ManageRoutineScreen = ({ route, navigation }) => {
    const { routine, type } = route.params || {};
    const isEditing = !!routine;

    const [id, setId] = useState(routine?.id || '');
    const [name, setName] = useState(routine?.name || '');
    const [description, setDescription] = useState(routine?.description || '');
    const [routineType, setRoutineType] = useState(type || routine?.type || 'main');
    const [order, setOrder] = useState(routine?.order?.toString() || '0');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        navigation.setOptions({
            title: isEditing ? 'ແກ້ໄຂກິດຈະວັດ' : 'ເພີ່ມກິດຈະວັດໃໝ່'
        });
    }, [navigation, isEditing]);

    const handleSave = async () => {
        if (!id.trim() || !name.trim()) {
            return Alert.alert('ຜິດພາດ', 'ກະລຸນາປ້ອນ ID ແລະ ຊື່ກິດຈະວັດ');
        }

        setLoading(true);

        const routineData = {
            id: id.toUpperCase().trim(),
            name: name.trim(),
            description: description.trim(),
            type: routineType,
            order: parseInt(order) || 0
        };

        let result;
        if (isEditing) {
            result = await routineService.updateRoutine(routine.id, routineData);
        } else {
            result = await routineService.createRoutine(routineData);
        }

        setLoading(false);

        if (result.success) {
            Alert.alert('ສຳເລັດ', isEditing ? 'ແກ້ໄຂກິດຈະວັດສຳເລັດ' : 'ເພີ່ມກິດຈະວັດສຳເລັດ');
            navigation.goBack();
        } else {
            Alert.alert('ຜິດພາດ', result.error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>ຂໍ້ມູນກິດຈະວັດ</Text>

                <Text style={styles.label}>ID ກິດຈະວັດ (A-Z) *</Text>
                <TextInput
                    style={[styles.input, isEditing && styles.inputDisabled]}
                    value={id}
                    onChangeText={setId}
                    placeholder="ເຊັ່ນ: A, B, C"
                    maxLength={1}
                    autoCapitalize="characters"
                    editable={!isEditing}
                />

                <Text style={styles.label}>ຊື່ກິດຈະວັດ *</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="ເຊັ່ນ: ບິນທະບາດ"
                />

                <Text style={styles.label}>ລາຍລະອຽດ (ຖ້າມີ)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="ເຊັ່ນ: ປັດເດີ່ນວັດ, ຖູສາລາ"
                    multiline
                    numberOfLines={3}
                />

                <Text style={styles.label}>ປະເພດ *</Text>
                <View style={styles.typeContainer}>
                    <TouchableOpacity
                        style={[styles.typeButton, routineType === 'main' && styles.typeButtonActive]}
                        onPress={() => setRoutineType('main')}
                    >
                        <Text style={[styles.typeButtonText, routineType === 'main' && styles.typeButtonTextActive]}>
                            ກິດຈະວັດຫຼັກ
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeButton, routineType === 'sub' && styles.typeButtonActive]}
                        onPress={() => setRoutineType('sub')}
                    >
                        <Text style={[styles.typeButtonText, routineType === 'sub' && styles.typeButtonTextActive]}>
                            ກິດຈະວັດຍ່ອຍ
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>ລຳດັບການສະແດງ</Text>
                <TextInput
                    style={styles.input}
                    value={order}
                    onChangeText={setOrder}
                    placeholder="0"
                    keyboardType="numeric"
                />

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.secondary} />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            {isEditing ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມກິດຈະວັດ'}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelButtonText}>ຍົກເລີກ</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: SIZES.padding,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    inputDisabled: {
        backgroundColor: '#f5f5f5',
        color: '#999',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    typeButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: COLORS.primary,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    typeButtonActive: {
        backgroundColor: COLORS.primary,
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    typeButtonTextActive: {
        color: COLORS.secondary,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#e0e0e0',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ManageRoutineScreen;

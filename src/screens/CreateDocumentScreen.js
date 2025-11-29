import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import documentService from '../services/documentService';

const CreateDocumentScreen = ({ route, navigation }) => {
    const { document } = route.params || {};
    const { user } = useAuth();
    const isEditing = !!document;
    const isPdf = isEditing && document.type === 'pdf';

    const [title, setTitle] = useState(document?.title || '');
    const [category, setCategory] = useState(document?.category || 'Manual');
    const [sections, setSections] = useState(document?.sections || [{ heading: '', content: '' }]);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const categories = [
        { id: 'Manual', name: 'ບົດໄຫວ້ພຣະ (Manual)' },
        { id: 'Forms', name: 'ບົດສູດ (Forms)' },
        { id: 'Policy', name: 'ບົດເທດ (Policy)' },
        { id: 'Reports', name: 'ທຳມະ (Reports)' },
        { id: 'Others', name: 'ອື່ນໆ (Others)' },
    ];

    const addSection = () => {
        setSections([...sections, { heading: '', content: '' }]);
    };

    const removeSection = (index) => {
        if (sections.length === 1) {
            Alert.alert('ບໍ່ສາມາດລຶບได้', 'ຕ້ອງມີຢ່າງໜ້ອຍ 1 ສ່ວນ');
            return;
        }
        const newSections = sections.filter((_, i) => i !== index);
        setSections(newSections);
    };

    const updateSection = (index, field, value) => {
        const newSections = [...sections];
        newSections[index][field] = value;
        setSections(newSections);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('ຜິດພາດ', 'ກະລຸນາປ້ອນຫົວຂໍ້');
            return;
        }

        if (!isPdf) {
            const hasContent = sections.some(s => s.content.trim());
            if (!hasContent) {
                Alert.alert('ຜິດພາດ', 'ກະລຸນາປ້ອນເນື້ອຫາຢ່າງໜ້ອຍ 1 ສ່ວນ');
                return;
            }
        }

        let documentData = {
            title: title.trim(),
            category,
            sections: sections.filter(s => s.content.trim()),
            createdBy: user?.personalInfo?.name || user?.email,
            type: 'builtin',
        };

        // If editing a PDF, we only update title and category.
        if (isPdf) {
            documentData = { title: title.trim(), category };
        }

        try {
            let result;
            if (isEditing && document?.id) {
                result = await documentService.updateDocument(document.id, documentData);
            } else {
                result = await documentService.createDocument(documentData);
            }

            if (result.success) {
                Alert.alert(
                    'ສຳເລັດ',
                    isEditing ? 'ແກ້ໄຂເອກະສານສຳເລັດ' : 'ສ້າງເອກະສານສຳເລັດ',
                    [{ text: 'ຕົກລົງ', onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert('ຜິດພາດ', 'ບໍ່ສາມາດບັນທຶກເອກະສານໄດ້: ' + result.error);
            }
        } catch (error) {
            Alert.alert('ຜິດພາດ', 'ເກີດຂໍ້ຜິດພາດ: ' + error.message);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.formTitle}>
                    {isEditing ? 'ແກ້ໄຂເອກະສານ' : 'ສ້າງເອກະສານໃໝ່'}
                </Text>

                <Text style={styles.label}>ຫົວຂໍ້ *</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="ໃສ່ຫົວຂໍ້ເອກະສານ"
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>ປະເພດເອກະສານ *</Text>
                <TouchableOpacity
                    style={styles.categorySelector}
                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                    <Text style={styles.categorySelectorText}>
                        {categories.find(c => c.id === category)?.name}
                    </Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>

                {showCategoryPicker && (
                    <View style={styles.categoryPicker}>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={styles.categoryOption}
                                onPress={() => {
                                    setCategory(cat.id);
                                    setShowCategoryPicker(false);
                                }}
                            >
                                <Text style={[
                                    styles.categoryOptionText,
                                    category === cat.id && styles.selectedCategoryText
                                ]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {!isPdf && (
                    <>
                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>ເນື້ອหาເອກະສານ</Text>

                        {sections.map((section, index) => (
                            <View key={index} style={styles.sectionCard}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionNumber}>ສ່ວນທີ {index + 1}</Text>
                                    {sections.length > 1 && (
                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={() => removeSection(index)}
                                        >
                                            <Text style={styles.removeButtonText}>✕ ລຶບ</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <Text style={styles.label}>ຫົວຂໍ້ຍ່ອຍ (ຖ້າມີ)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={section.heading}
                                    onChangeText={(text) => updateSection(index, 'heading', text)}
                                    placeholder="ຕົວຢ່າງ: ບົດນຳ, ຈຸດປະສົງ"
                                    placeholderTextColor="#999"
                                />

                                <Text style={styles.label}>ເນື້ອຫາ *</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={section.content}
                                    onChangeText={(text) => updateSection(index, 'content', text)}
                                    placeholder="ປ້ອນເນື້ອຫາຂອງສ່ວນນີ້"
                                    placeholderTextColor="#999"
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                />
                            </View>
                        ))}

                        <TouchableOpacity style={styles.addSectionButton} onPress={addSection}>
                            <Text style={styles.addSectionButtonText}>+ ເພີ່ມສ່ວນໃໝ່</Text>
                        </TouchableOpacity>
                    </>
                )}

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.cancelButtonText}>ຍົກເລີກ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>
                            {isEditing ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງເອກະສານ'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    card: {
        backgroundColor: COLORS.secondary,
        margin: SIZES.padding,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        elevation: 2,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: COLORS.text,
    },
    textArea: {
        minHeight: 120,
    },
    categorySelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius,
        padding: 12,
        backgroundColor: '#fff',
    },
    categorySelectorText: {
        fontSize: 16,
        color: COLORS.text,
    },
    dropdownIcon: {
        fontSize: 12,
        color: '#666',
    },
    categoryPicker: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius,
        marginTop: 5,
        backgroundColor: '#fff',
        elevation: 3,
    },
    categoryOption: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoryOptionText: {
        fontSize: 16,
        color: COLORS.text,
    },
    selectedCategoryText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    divider: {
        height: 2,
        backgroundColor: COLORS.goldLight,
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 15,
    },
    sectionCard: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: SIZES.radius,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    removeButton: {
        backgroundColor: '#ff4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    addSectionButton: {
        backgroundColor: COLORS.goldLight,
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
    },
    addSectionButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 25,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#ddd',
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 16,
    },
    saveButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CreateDocumentScreen;

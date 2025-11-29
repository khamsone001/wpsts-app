import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import documentService from '../services/documentService';
import * as DocumentPicker from 'expo-document-picker';
import { uploadPdfAsync } from '../services/uploadService';

const DocumentsScreen = ({ navigation }) => {
    const { userRole } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [allDocs, setAllDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    const canCreateDocument = ['admin', 'super_admin'].includes(userRole);

    const categories = [
        { id: 'All', name: 'ທັງໝົດ' },
        { id: 'Manual', name: 'ບົດໄຫວ້ພຣະ' },
        { id: 'Forms', name: 'ບົດສູດ' },
        { id: 'Policy', name: 'ບົດເທດ' },
        { id: 'Reports', name: 'ທຳມະ' },
        { id: 'Others', name: 'ອື່ນໆ' },
    ];

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        const result = await documentService.getAllDocuments();
        if (result.success) {
            setAllDocs(result.documents);
        }
        setLoading(false);
    };

    // Refresh when coming back from create/edit screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchDocuments();
        });
        return unsubscribe;
    }, [navigation]);

    const handleUploadPdf = async () => {
        try {
            const docRes = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
            });

            if (docRes.canceled === false) {
                setLoading(true);
                const { uri, name, size } = docRes.assets[0];
                const uploadResult = await uploadPdfAsync(uri, name);

                // Create a document entry for the uploaded PDF
                const newDocument = {
                    title: name,
                    category: 'Others', // Default category, can be changed later
                    sections: [{ content: uploadResult.url }], // Store URL in content
                    type: 'pdf',
                    size: size ? `${(size / 1024 / 1024).toFixed(2)} MB` : undefined,
                };
                await documentService.createDocument(newDocument);
                Alert.alert('ສຳເລັດ', 'ອັບໂຫຼດ PDF ສຳເລັດ!');
                fetchDocuments(); // Refresh the list
            }
        } catch (error) {
            console.error("PDF Upload Error:", error);
            Alert.alert('ຜິດພາດ', 'ບໍ່ສາມາດອັບໂຫຼດ PDF ໄດ້: ' + error.message);
            setLoading(false);
        }
    };

    const filteredDocs = selectedCategory === 'All'
        ? allDocs
        : allDocs.filter(doc => doc.category === selectedCategory);

    const CategoryButton = ({ category }) => (
        <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === category.id && styles.activeCategoryButton]}
            onPress={() => setSelectedCategory(category.id)}
        >
            <Text style={[styles.categoryText, selectedCategory === category.id && styles.activeCategoryText]}>
                {category.name}
            </Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                if (item.type === 'builtin') {
                    navigation.navigate('DocumentDetail', { document: item });
                } else {
                    // Open PDF file in browser
                    const url = item.sections[0]?.content;
                    if (url) Linking.openURL(url);
                }
            }}
        >
            <View style={styles.iconPlaceholder}>
                <Text style={styles.iconText}>{item.type === 'builtin' ? '📄' : '📎'}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.metaRow}>
                    {item.size && <Text style={styles.size}>{item.size}</Text>}
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                            {categories.find(c => c.id === item.category)?.name || item.category}
                        </Text>
                    </View>
                    {item.type === 'builtin' && (
                        <View style={styles.builtinBadge}>
                            <Text style={styles.builtinBadgeText}>ເອກະສານໃນລະບົບ</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>ຫໍສະໝຸດ</Text>
                {canCreateDocument && (
                    <View style={styles.adminButtons}>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => navigation.navigate('CreateDocument')}
                        >
                            <Text style={styles.createButtonText}>+ ສ້າງເອກະສານ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.createButton, { backgroundColor: COLORS.goldLight, marginLeft: 10 }]}
                            onPress={handleUploadPdf}
                        >
                            <Text style={[styles.createButtonText, { color: COLORS.text }]}>+ ອັບໂຫຼດ PDF</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
                contentContainerStyle={styles.categoryContent}
            >
                {categories.map(category => (
                    <CategoryButton key={category.id} category={category} />
                ))}
            </ScrollView>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>ກຳລັງໂຫຼດເອກະສານ...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredDocs}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
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
        padding: SIZES.padding,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    adminButtons: {
        flexDirection: 'row',
    },
    createButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
    },
    createButtonText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    categoryContainer: {
        marginBottom: 15,
        maxHeight: 50,
    },
    categoryContent: {
        gap: 10,
    },
    categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: '#fff',
    },
    activeCategoryButton: {
        backgroundColor: COLORS.primary,
    },
    categoryText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    activeCategoryText: {
        color: COLORS.secondary,
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.secondary,
        padding: 15,
        borderRadius: SIZES.radius,
        marginBottom: 10,
        elevation: 2,
        alignItems: 'center',
    },
    iconPlaceholder: {
        width: 50,
        height: 50,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    iconText: {
        fontSize: 24,
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 5,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    size: {
        fontSize: 12,
        color: '#999',
    },
    categoryBadge: {
        backgroundColor: COLORS.goldLight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    categoryBadgeText: {
        fontSize: 10,
        color: COLORS.text,
        fontWeight: 'bold',
    },
    builtinBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    builtinBadgeText: {
        fontSize: 10,
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
});

export default DocumentsScreen;

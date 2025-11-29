import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const DocumentDetailScreen = ({ route, navigation }) => {
    const { document } = route.params;
    const { userRole } = useAuth();

    const canEdit = ['admin', 'super_admin'].includes(userRole);

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        const date = new Date(timestamp); // Keep date object
        return date.toLocaleDateString('lo-LA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCategoryName = (category) => {
        const categories = {
            'Manual': 'ບົດໄຫວ້ພຣະ',
            'Forms': 'ບົດສູດ',
            'Policy': 'ບົດເທດ',
            'Reports': 'ທຳມະ',
            'Others': 'ອື່ນໆ'
        };
        return categories[category] || category;
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{getCategoryName(document.category)}</Text>
                    </View>
                    {canEdit && (
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => navigation.navigate('CreateDocument', { document })}
                        >
                            <Text style={styles.editButtonText}>✏️ ແກ້ໄຂ</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.title}>{document.title}</Text>

                <View style={styles.metadata}>
                    <Text style={styles.metadataText}>
                        📅 {formatDate(document.createdAt)}
                    </Text>
                    {document.createdBy && (
                        <Text style={styles.metadataText}>
                            👤 {document.createdBy}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.content}>
                {document.sections && document.sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        {section.heading && (
                            <Text style={styles.sectionHeading}>{section.heading}</Text>
                        )}
                        <Text style={styles.sectionContent}>{section.content}</Text>
                    </View>
                ))}

                {!document.sections && document.content && (
                    <Text style={styles.sectionContent}>{document.content}</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.secondary,
        padding: SIZES.padding,
        paddingTop: 15,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    categoryBadge: {
        backgroundColor: COLORS.goldLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    categoryBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    editButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    editButtonText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
        lineHeight: 32,
    },
    metadata: {
        flexDirection: 'row',
        gap: 15,
    },
    metadataText: {
        fontSize: 13,
        color: '#666',
    },
    divider: {
        height: 3,
        backgroundColor: COLORS.primary,
        marginVertical: 0,
    },
    content: {
        padding: SIZES.padding,
    },
    section: {
        marginBottom: 25,
    },
    sectionHeading: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 12,
        lineHeight: 28,
    },
    sectionContent: {
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 26,
        textAlign: 'justify',
    },
});

export default DocumentDetailScreen;

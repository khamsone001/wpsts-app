import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants/theme';
import { WorkService } from '../services/workService';

const WorksScreen = ({ navigation }) => {
    const { userRole } = useAuth();
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchWorks();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchWorks = async () => {
        setLoading(true);
        const data = await WorkService.getAllWorks();
        setWorks(data);
        setLoading(false);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('WorkDetail', { workId: item.id })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardStatus}>{item.status}</Text>
            </View>
            <Text style={styles.cardDate}>Date: {item.startDate} | Time: {item.startTime}</Text>
            <Text style={styles.cardLocation}>Loc: {item.location}</Text>
            <Text style={styles.cardCount}>{item.selectedUsers?.length || 0} Personnel Assigned</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {userRole === 'super_admin' && (
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate('ExternalWork')}
                >
                    <Text style={styles.createButtonText}>+ Create New Work</Text>
                </TouchableOpacity>
            )}

            {(userRole === 'super_admin' || userRole === 'admin' || userRole === 'manager') && (
                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: COLORS.goldLight, marginBottom: 20 }]}
                    onPress={() => navigation.navigate('PersonnelList')}
                >
                    <Text style={[styles.createButtonText, { color: COLORS.text }]}>View Personnel List</Text>
                </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>All Works</Text>
            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
                <FlatList
                    data={works}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No works available.</Text>}
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
    createButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginBottom: 20,
    },
    createButtonText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: COLORS.text,
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: COLORS.secondary,
        padding: 15,
        borderRadius: SIZES.radius,
        marginBottom: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
    },
    cardStatus: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    cardDate: {
        fontSize: 14,
        color: '#666',
    },
    cardLocation: {
        fontSize: 14,
        color: '#666',
    },
    cardCount: {
        fontSize: 12,
        color: COLORS.goldDark,
        marginTop: 5,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
    },
});

export default WorksScreen;

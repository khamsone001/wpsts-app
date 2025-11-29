import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { UserService } from '../services/userService';
import { useNavigation } from '@react-navigation/native';

const PersonnelListScreen = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All'); // 'All', 'M', 'N'
    const navigation = useNavigation();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const data = await UserService.getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    const filteredUsers = users.filter(u => {
        if (filter === 'All') return true;
        return u.personalInfo?.class === filter;
    });

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('UserDetail', { uid: item.uid })}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.personalInfo?.name?.charAt(0) || 'U'}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.personalInfo?.name || item.email}</Text>
                <Text style={styles.details}>Class: {item.personalInfo?.class || '-'} | Age: {item.personalInfo?.age || '-'}</Text>
                <Text style={styles.details}>Skill: {item.workInfo?.skillLevel || 0}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                {['All', 'M', 'N'].map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterTab, filter === f && styles.activeFilterTab]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredUsers}
                    renderItem={renderItem}
                    keyExtractor={item => item.uid}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchUsers}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.secondary,
        padding: 10,
        elevation: 2,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeFilterTab: {
        borderBottomColor: COLORS.primary,
    },
    filterText: {
        color: '#666',
        fontWeight: 'bold',
    },
    activeFilterText: {
        color: COLORS.primary,
    },
    list: {
        padding: SIZES.padding,
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
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.goldLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    details: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
});

export default PersonnelListScreen;

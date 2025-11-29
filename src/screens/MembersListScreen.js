import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, ScrollView } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { UserService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const MembersListScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [filter, setFilter] = useState('All'); // 'All', 'M', 'N'
    const { userRole } = useAuth();

    useEffect(() => {
        const fetchMembers = async () => {
            const data = await UserService.getAllUsers();
            setMembers(data);
            setLoading(false);
        };
        const unsubscribe = navigation.addListener('focus', fetchMembers);
        return unsubscribe;
    }, [navigation]);

    // Separate managers and regular members
    const managers = members.filter(m => m.role === 'manager');
    const regularMembers = members.filter(m => m.role !== 'manager');

    const filteredMembers = regularMembers.filter(member => {
        if (filter === 'All') return true;
        return member.personalInfo?.class === filter;
    });

    const renderManagerCard = ({ item }) => (
        <TouchableOpacity
            style={styles.managerCard}
            onPress={() => navigation.navigate('UserDetail', { uid: item.uid })}
        >
            <View style={styles.managerCardInner}>
                <View style={styles.managerAvatarContainer}>
                    {item.photoURL ? (
                        <Image source={{ uri: item.photoURL }} style={styles.managerAvatar} />
                    ) : (
                        <View style={styles.managerAvatarPlaceholder}>
                            <Text style={styles.managerAvatarText}>
                                {item.personalInfo?.name?.charAt(0) || item.email?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.managerInfo}>
                    <Text style={styles.managerName} numberOfLines={1}>
                        {item.personalInfo?.name || item.email}
                    </Text>
                    {userRole === 'super_admin' && (
                        <Text style={styles.emailText}>{item.email}</Text>
                    )}
                    <View style={styles.managerRoleBadge}>
                        <Text style={styles.managerRoleText}>MANAGER</Text>
                    </View>
                    <Text style={styles.managerClass}>Class {item.personalInfo?.class === 'M' ? 'ພຣະ' : 'ສ.ນ'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderMemberItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('UserDetail', { uid: item.uid })}
        >
            <View style={styles.avatar}>
                {item.photoURL ? (
                    <Image source={{ uri: item.photoURL }} style={styles.avatarImage} />
                ) : (
                    <Text style={styles.avatarText}>
                        {item.personalInfo?.name?.charAt(0) || item.email?.charAt(0).toUpperCase()}
                    </Text>
                )}
            </View>
            <Text style={styles.name} numberOfLines={1}>{item.personalInfo?.name || item.email}</Text>
            <Text style={styles.role}>Class {item.personalInfo?.class === 'M' ? 'ພຣະ' : 'ສ.ນ'}</Text>
        </TouchableOpacity>
    );

    const getCount = (type) => {
        if (type === 'All') return regularMembers.length;
        return regularMembers.filter(m => m.personalInfo?.class === type).length;
    };

    const FilterButton = ({ title, value }) => (
        <TouchableOpacity
            style={[styles.filterButton, filter === value && styles.activeFilterButton]}
            onPress={() => setFilter(value)}
        >
            <Text style={[styles.filterText, filter === value && styles.activeFilterText]}>
                {title} ({getCount(value === 'All' ? 'All' : value)})
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>ກຳລັງໂຫຼດຂໍ້ມູນສະມາຊິກ...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>ຈຳນວນພຣະ-ເນນທັງໝົດ</Text>
                <Text style={styles.subtitle}>ພຣະ-ເນນທັງໝົດ ({members.length})</Text>
            </View>

            {/* Managers Section */}
            {managers.length > 0 && (
                <View style={styles.managersSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>ເຈົ້າອາວາດ</Text>
                        <View style={styles.sectionDivider} />
                    </View>
                    <View style={styles.managerContainer}>
                        {managers.map((manager) => (
                            <TouchableOpacity
                                key={manager.uid}
                                style={styles.managerCard}
                                onPress={() => navigation.navigate('UserDetail', { uid: manager.uid })}
                            >
                                <View style={styles.managerCardInner}>
                                    <View style={styles.managerAvatarContainer}>
                                        {manager.photoURL ? (
                                            <Image source={{ uri: manager.photoURL }} style={styles.managerAvatar} />
                                        ) : (
                                            <View style={styles.managerAvatarPlaceholder}>
                                                <Text style={styles.managerAvatarText}>
                                                    {manager.personalInfo?.name?.charAt(0) || manager.email?.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.managerInfo}>
                                        <Text style={styles.managerName} numberOfLines={1}>
                                            {manager.personalInfo?.name || manager.email}
                                        </Text>
                                        <View style={styles.managerRoleBadge}>
                                            <Text style={styles.managerRoleText}>ເຈົ້າອາວາດ</Text>
                                        </View>
                                        <Text style={styles.managerClass}>Class {manager.personalInfo?.class === 'M' ? 'ພຣະ' : 'ສ.ນ'}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Regular Members Section */}
            <View style={styles.membersSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>📋 ສະມາຊິກ</Text>
                    <View style={styles.sectionDivider} />
                </View>

                <View style={styles.filterContainer}>
                    <FilterButton title="ທັງໝົດ" value="All" />
                    <FilterButton title="Class ພຣະ" value="M" />
                    <FilterButton title="Class ສ.ນ" value="N" />
                </View>

                <FlatList
                    data={filteredMembers}
                    keyExtractor={(item) => item.uid}
                    renderItem={renderMemberItem}
                    numColumns={3}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    scrollEnabled={false}
                />
            </View>
        </ScrollView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    header: {
        backgroundColor: COLORS.primary,
        padding: 20,
        paddingTop: 15,
        paddingBottom: 25,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.secondary,
        opacity: 0.9,
        marginTop: 5,
    },
    managersSection: {
        backgroundColor: '#fff',
        paddingVertical: 20,
        marginBottom: 10,
        elevation: 2,
    },
    membersSection: {
        backgroundColor: '#fff',
        paddingTop: 20,
        minHeight: 400,
    },
    sectionHeader: {
        paddingHorizontal: SIZES.padding,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    sectionDivider: {
        height: 3,
        backgroundColor: COLORS.goldLight,
        borderRadius: 2,
        width: 60,
    },
    managerContainer: {
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
    },
    managerCard: {
        width: 280,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        borderWidth: 2,
        borderColor: COLORS.goldLight,
    },
    managerCardInner: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: `${COLORS.primary}10`,
    },
    managerAvatarContainer: {
        marginBottom: 15,
    },
    managerAvatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: COLORS.primary,
    },
    managerAvatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: COLORS.goldLight,
    },
    managerAvatarText: {
        fontSize: 48,
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    managerInfo: {
        alignItems: 'center',
        width: '100%',
    },
    managerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    emailText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
        textAlign: 'center',
    },
    emailTextSmall: {
        fontSize: 10,
        color: '#666',
        marginBottom: 2,
        textAlign: 'center',
        width: '100%',
    },
    managerRoleBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 6,
    },
    managerRoleText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    managerClass: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 15,
        paddingHorizontal: SIZES.padding,
        backgroundColor: '#fff',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 10,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: '#fff',
    },
    activeFilterButton: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    activeFilterText: {
        color: COLORS.secondary,
    },
    listContent: {
        padding: SIZES.padding,
        paddingTop: 5,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 15,
        alignItems: 'center',
        width: '31%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: COLORS.goldLight,
    },
    avatarText: {
        fontSize: 24,
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    avatarImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
        textAlign: 'center',
    },
    role: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
});

export default MembersListScreen;

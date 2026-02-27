import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants/theme';

const DashboardScreen = ({ navigation }) => {
    const { user, userRole, logout } = useAuth();

    const menuOptions = [
        {
            id: 'workSchedule',
            title: 'ຕາຕະລາງ',
            subtitle: 'Work Schedule',
            icon: '📅',
            onPress: () => navigation.navigate('WorkSchedule'),
            color: '#4CAF50',
        },
        {
            id: 'members',
            title: 'ສະມາຊິກທັງໝົດ',
            subtitle: 'All Members',
            icon: '👥',
            onPress: () => navigation.navigate('MembersList'),
            color: '#2196F3',
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcome}>Welcome, {user?.personalInfo?.name || user?.email}</Text>
                <Text style={styles.role}>Role: {userRole?.toUpperCase()}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>ເມນູຫຼັກ</Text>

                <View style={styles.menuGrid}>
                    {menuOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[styles.menuCard, { borderLeftColor: option.color, borderLeftWidth: 4 }]}
                            onPress={option.onPress}
                        >
                            <Text style={styles.menuIcon}>{option.icon}</Text>
                            <View style={styles.menuTextContainer}>
                                <Text style={styles.menuTitle}>{option.title}</Text>
                                <Text style={styles.menuSubtitle}>{option.subtitle}</Text>
                            </View>
                            <Text style={styles.menuArrow}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {userRole === 'super_admin' && (
                    <View style={styles.adminPanel}>
                        <Text style={styles.adminText}>Super Admin Controls</Text>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => navigation.navigate('ExternalWork')}
                        >
                            <Text style={styles.navButtonText}>📋 Create External Work</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SIZES.padding,
    },
    header: {
        marginTop: 40,
        marginBottom: 20,
    },
    welcome: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    role: {
        fontSize: 14,
        color: COLORS.text,
        marginTop: 5,
        opacity: 0.7,
    },
    content: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: COLORS.text,
    },
    menuGrid: {
        marginBottom: 20,
    },
    menuCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 12,
        color: COLORS.text,
        opacity: 0.6,
    },
    menuArrow: {
        fontSize: 24,
        color: COLORS.text,
        opacity: 0.3,
    },
    adminPanel: {
        backgroundColor: COLORS.goldLight,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    adminText: {
        color: COLORS.text,
        marginBottom: 10,
        fontWeight: '600',
    },
    navButton: {
        backgroundColor: COLORS.secondary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    navButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    logoutButton: {
        backgroundColor: COLORS.error,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    logoutText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default DashboardScreen;

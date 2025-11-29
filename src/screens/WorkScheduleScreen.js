import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { WorkService } from '../services/workService';
import { useAuth } from '../context/AuthContext';

const WorkScheduleScreen = ({ navigation }) => {
    const { user, userRole } = useAuth();
    const [loading, setLoading] = useState(true);
    const [works, setWorks] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchWorks = async () => {
        setLoading(true);
        let data = await WorkService.getAllWorks();

        // Helper to parse date and time string into a Date object
        const parseDateTime = (dateStr, timeStr) => {
            if (!dateStr || !timeStr) return null;
            const [day, month, year] = dateStr.split('/');
            const [hours, minutes] = timeStr.split(':');
            return new Date(year, month - 1, day, hours, minutes);
        };

        // Sort works by the nearest start date and time
        data.sort((a, b) => parseDateTime(a.startDate, a.startTime) - parseDateTime(b.startDate, b.startTime));

        setWorks(data);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchWorks);
        return unsubscribe;
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchWorks();
    };

    const filteredWorks = statusFilter === 'All'
        ? works
        : works.filter(work => work.status === statusFilter);

    const FilterButton = ({ title, value }) => (
        <TouchableOpacity
            style={[styles.filterButton, statusFilter === value && styles.activeFilterButton]}
            onPress={() => setStatusFilter(value)}
        >
            <Text style={[styles.filterText, statusFilter === value && styles.activeFilterText]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    const getDaysRemainingString = (item) => {
        // If work is completed or cancelled, show status instead of countdown
        if (item.status === 'Completed' || item.status === 'Cancelled') {
            return null;
        }

        const parseDate = (dateStr) => {
            if (!dateStr || !dateStr.includes('/')) return null;
            const [day, month, year] = dateStr.split('/');
            return new Date(year, month - 1, day);
        };

        const workDate = parseDate(item.startDate);
        if (!workDate) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        workDate.setHours(0, 0, 0, 0);

        const diffTime = workDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) return `ເຫຼືອອີກ ${diffDays} ມື້`;
        if (diffDays === 0) return 'ມື້ນີ້';
        return 'ຜ່ານໄປແລ້ວ';
    };

    const renderWorkItem = ({ item }) => (
        <TouchableOpacity
            style={styles.workCard}
            onPress={() => navigation.navigate('WorkDetail', { workId: item.id })}
        >
            <View style={styles.workHeader}>
                <Text style={styles.workTitle}>{item.title}</Text>
                <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
                    <Text style={styles.statusText}>{getDaysRemainingString(item) || item.status}</Text>
                </View>
            </View>
            <View style={styles.workDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>📅 ວັນທີ:</Text>
                    <Text style={styles.value}>{item.startDate}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>⏰ ເວລາ:</Text>
                    <Text style={styles.value}>{item.startTime}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>📍 ສະຖານທີ່:</Text>
                    <Text style={styles.value}>{item.location}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>👥 ຜູ້ໄປກິດນິມົນ:</Text>
                    <Text style={styles.value}>{item.selectedUsers?.length || 0} ອົງ</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    // Check if user is approved. If not, show a pending screen.
    // A super_admin should always have access, regardless of approval status.
    if (!user?.isApproved && user?.role !== 'super_admin') {
        return (
            <View style={styles.pendingContainer}>
                <Text style={styles.pendingIcon}>⏳</Text>
                <Text style={styles.pendingText}>ບັນຊີຂອງທ່ານກຳລັງລໍການອະນຸມັດຈາກ Admin.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <FilterButton title="ທັງໝົດ" value="All" />
                    <FilterButton title="ລໍດຳເນີນການ" value="Pending" />
                    <FilterButton title="ກຳລັງດຳເນີນການ" value="In Progress" />
                    <FilterButton title="ສຳເລັດ" value="Completed" />
                    <FilterButton title="ຍົກເລີກ" value="Cancelled" />
                </ScrollView>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                >
                    {filteredWorks.map((item) => <React.Fragment key={item.id}>{renderWorkItem({ item })}</React.Fragment>)}
                </ScrollView>
            )}
            {(userRole === 'admin' || userRole === 'super_admin') && (
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ExternalWork')}>
                    <Text style={styles.addButtonText}>+ ເພີ່ມກິດນິມົນ</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 30, paddingBottom: 25 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 5 },
    headerSubtitle: { fontSize: 14, color: COLORS.secondary, opacity: 0.9 },
    filterContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', elevation: 2 },
    filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary, marginRight: 8, backgroundColor: '#fff' },
    activeFilterButton: { backgroundColor: COLORS.primary },
    filterText: { color: COLORS.primary, fontWeight: 'bold' },
    activeFilterText: { color: COLORS.secondary },
    scrollView: { flex: 1, padding: SIZES.padding },
    workCard: { backgroundColor: COLORS.secondary, borderRadius: SIZES.radius, padding: 15, marginBottom: 15, elevation: 3, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
    workHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    workTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, flex: 1, marginRight: 10 },
    statusBadge: { backgroundColor: COLORS.goldLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    statusPending: { backgroundColor: '#FFC107' },
    statusInProgress: { backgroundColor: '#2196F3' },
    statusCompleted: { backgroundColor: '#4CAF50' },
    statusCancelled: { backgroundColor: '#f44336' },
    statusText: { color: COLORS.text, fontSize: 12, fontWeight: 'bold' },
    workDetails: { gap: 8 },
    detailRow: { flexDirection: 'row', alignItems: 'center' },
    label: { fontSize: 14, color: '#666', width: 100 },
    value: { fontSize: 14, color: COLORS.text, fontWeight: '500', flex: 1 },
    addButton: { backgroundColor: COLORS.primary, padding: 16, alignItems: 'center', margin: SIZES.padding, borderRadius: 12 },
    addButtonText: { color: COLORS.secondary, fontSize: 16, fontWeight: 'bold' },
    pendingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background,
    },
    pendingIcon: {
        fontSize: 48,
        marginBottom: 20,
    },
    pendingText: {
        fontSize: 18,
        textAlign: 'center',
        color: COLORS.text,
    },
});

export default WorkScheduleScreen;

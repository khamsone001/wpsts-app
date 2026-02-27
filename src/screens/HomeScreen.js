import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants/theme';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { OfflineManager } from '../services/offlineManager';
import { WorkService } from '../services/workService';
import routineService from '../services/routineService';
import { ScrollView } from 'react-native';

const HomeScreen = () => {
    const navigation = useNavigation();
    const [pendingSync, setPendingSync] = React.useState(0);
    const [upcomingWorks, setUpcomingWorks] = React.useState([]);
    const [loadingWorks, setLoadingWorks] = React.useState(true);
    const [routines, setRoutines] = React.useState([]);
    const [loadingRoutines, setLoadingRoutines] = React.useState(true);

    const fetchUpcomingWorks = async () => {
        setLoadingWorks(true);
        try {
            const data = await WorkService.getAllWorks();

            // Sort to get nearest/pending works
            const sorted = data.filter(w => w.status !== 'Completed' && w.status !== 'Cancelled')
                .sort((a, b) => {
                    const parseDate = (d) => {
                        if (!d || !d.includes('/')) return new Date(8640000000000000);
                        const [day, month, year] = d.split('/');
                        return new Date(year, month - 1, day);
                    };
                    return parseDate(a.startDate) - parseDate(b.startDate);
                });

            setUpcomingWorks(sorted.slice(0, 5)); // Show top 5
        } catch (error) {
            console.error('Error fetching works for home:', error);
        } finally {
            setLoadingWorks(false);
        }
    };

    const fetchRoutines = async () => {
        setLoadingRoutines(true);
        try {
            // Only fetch MAIN routines as requested
            const data = await routineService.getRoutinesByType('main');
            setRoutines(data.slice(0, 5));
        } catch (error) {
            console.error('Error fetching routines:', error);
        } finally {
            setLoadingRoutines(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            const init = async () => {
                const length = await OfflineManager.getQueueLength();
                setPendingSync(length);
                fetchUpcomingWorks();
                fetchRoutines();
            };
            init();
        }, [])
    );

    const workScrollX = React.useRef(new Animated.Value(0)).current;
    const routineScrollX = React.useRef(new Animated.Value(0)).current;
    const ITEM_SIZE = SCREEN_WIDTH;
    const CARD_WIDTH = SCREEN_WIDTH * 0.68;

    const getRoutineIcon = (title, index) => {
        const t = title?.toLowerCase() || '';
        // Priority 1: Positional Defaults for first 4 items as requested
        if (index === 0) return '🥣';
        if (index === 1) return '🧘‍♂️';
        if (index === 2) return '🧘‍♂️';
        if (index === 3) return '🧹';

        // Priority 2: Keyword based matching
        if (t.includes('เช้า') || t.includes('morning')) return '🌅';
        if (t.includes('เย็น') || t.includes('evening')) return '🌇';
        if (t.includes('บิณฑบาต') || t.includes('เดิน')) return '🥣';
        if (t.includes('สวด') || t.includes('ธรรม')) return '📖';
        if (t.includes('เพล') || t.includes('กิน') || t.includes('ฉัน')) return '🍽️';
        if (t.includes('กวาด') || t.includes('สะอาด')) return '🧹';
        if (t.includes('สมาธิ') || t.includes('นั่ง')) return '🧘‍♂️';
        if (t.includes('เรียน') || t.includes('บาลี')) return '🎓';

        return '🕉️'; // Final fallback
    };

    const renderStackItem = (item, index, scrollX, dataLength, isRoutine = false) => {
        const STACK_OFFSET = 24;

        const SHIFT_OFFSET = -15; // Shift slightly to the left

        const translateX = scrollX.interpolate({
            inputRange: [
                (index - 2) * ITEM_SIZE,
                (index - 1) * ITEM_SIZE,
                index * ITEM_SIZE,
                (index + 1) * ITEM_SIZE
            ],
            outputRange: [
                (STACK_OFFSET * 2) - (2 * ITEM_SIZE) + SHIFT_OFFSET,
                STACK_OFFSET - ITEM_SIZE + SHIFT_OFFSET,
                SHIFT_OFFSET,
                - ITEM_SIZE + SHIFT_OFFSET
            ],
            extrapolate: 'clamp'
        });

        const scale = scrollX.interpolate({
            inputRange: [
                (index - 2) * ITEM_SIZE,
                (index - 1) * ITEM_SIZE,
                index * ITEM_SIZE,
            ],
            outputRange: [0.82, 0.9, 1],
            extrapolate: 'clamp'
        });

        const opacity = scrollX.interpolate({
            inputRange: [
                (index - 2) * ITEM_SIZE,
                (index - 1) * ITEM_SIZE,
                index * ITEM_SIZE,
                (index + 1) * ITEM_SIZE,
            ],
            outputRange: [0.5, 0.85, 1, 0],
            extrapolate: 'clamp'
        });

        return (
            <View key={item.id} style={{ width: ITEM_SIZE, alignItems: 'center' }}>
                <Animated.View style={{
                    width: CARD_WIDTH,
                    zIndex: dataLength - index,
                    opacity,
                    transform: [
                        { translateX },
                        { scale }
                    ]
                }}>
                    <TouchableOpacity
                        style={styles.workPreviewCard}
                        activeOpacity={0.9}
                        onPress={() => {
                            if (isRoutine) {
                                navigation.navigate('RoutineAttendance', {
                                    routine: item.id,
                                    routineName: item.name,
                                    routineDesc: item.description
                                });
                            } else {
                                navigation.navigate('WorkDetail', { workId: item.id });
                            }
                        }}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.dayText} numberOfLines={1}>
                                {isRoutine ? item.name : (item.startDate?.split('/')[0] === new Date().getDate().toString() ? 'Today' : 'ລໍຖ້າດຳເນີນການ')}
                            </Text>
                            {isRoutine ? (
                                <Text style={styles.routineIconStyle}>{getRoutineIcon(item.name, index)}</Text>
                            ) : (
                                <View style={styles.goldDot} />
                            )}
                        </View>

                        {!isRoutine && (
                            <Text style={styles.cardTitle} numberOfLines={1}>
                                {item.title}
                            </Text>
                        )}

                        <View style={styles.listContainer}>
                            <View style={styles.listItem}>
                                <View style={styles.itemDot} />
                                <Text style={styles.itemText}>{isRoutine ? item.type === 'main' ? 'ກິດຈະວັດຫຼັກ' : 'ກິດຈະວັດຍ່ອຍ' : item.location}</Text>
                            </View>
                            {!isRoutine && (
                                <View style={styles.listItem}>
                                    <View style={styles.itemDot} />
                                    <Text style={styles.itemText}>{`${item.startDate} | ${item.startTime}`}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ວັດປ່າສັນຕິສຸຂ</Text>
                <Text style={styles.headerSubtitle}>ບ້ານດອນໜູນ ເມືອງໄຊທານີ ນະຄອນຫຼວງວຽງຈັນ</Text>
            </View>

            {/* Offline Sync Status */}
            {pendingSync > 0 && (
                <View style={styles.syncStatus}>
                    <Text style={styles.syncText}>⏳ ມີ {pendingSync} ລາຍການລໍຖ້າການອັບໂຫຼດ (Offline)</Text>
                </View>
            )}

            {/* Quick navigation options */}
            <View style={styles.optionsContainer}>
                <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate('WorkSchedule')}>
                    <Text style={styles.optionIcon}>📅</Text>
                    <Text style={styles.optionTitle}>ຈັດການກິດນິມົນ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate('Activities')}>
                    <Text style={styles.optionIcon}>📋</Text>
                    <Text style={styles.optionTitle}>ກິດຈະວັດ</Text>
                </TouchableOpacity>
            </View>

            {/* Section 1: Work Schedule */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📅 ກິດນິມົນທີ່ຈະມາເຖິງ</Text>
                <TouchableOpacity onPress={() => navigation.navigate('WorkSchedule')}>
                    <Text style={styles.seeAll}>ເບິ່ງທັງໝົດ {'>'}</Text>
                </TouchableOpacity>
            </View>

            {loadingWorks ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 40 }} />
            ) : upcomingWorks.length > 0 ? (
                <View style={[styles.stackPreviewContainer, { overflow: 'visible' }]}>
                    <Animated.ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ width: ITEM_SIZE * upcomingWorks.length }}
                        scrollEventThrottle={16}
                        style={{ overflow: 'visible' }}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: workScrollX } } }],
                            { useNativeDriver: true }
                        )}
                    >
                        {upcomingWorks.map((item, index) => renderStackItem(item, index, workScrollX, upcomingWorks.length))}
                    </Animated.ScrollView>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>ບໍ່ມີກິດນິມົນที่ກຳລັງຈະມາເຖິງ</Text>
                </View>
            )}

            {/* Section 2: Activities (Routines) */}
            <View style={[styles.sectionHeader, { marginTop: 30 }]}>
                <Text style={styles.sectionTitle}>📋 ກິດຈະວັດປະຈຳວັນ</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Activities')}>
                    <Text style={styles.seeAll}>ເບິ່ງທັງໝົດ {'>'}</Text>
                </TouchableOpacity>
            </View>

            {loadingRoutines ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 40 }} />
            ) : routines.length > 0 ? (
                <View style={[styles.stackPreviewContainer, { overflow: 'visible', marginBottom: 40 }]}>
                    <Animated.ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ width: ITEM_SIZE * routines.length }}
                        scrollEventThrottle={16}
                        style={{ overflow: 'visible' }}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: routineScrollX } } }],
                            { useNativeDriver: true }
                        )}
                    >
                        {routines.map((item, index) => renderStackItem(item, index, routineScrollX, routines.length, true))}
                    </Animated.ScrollView>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>ບໍ່ມີກິດຈະວັດໃນຕອນນີ້</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    headerTitle: { fontSize: 30, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 5, textAlign: 'center' },
    headerSubtitle: { fontSize: 16, color: COLORS.secondary, opacity: 0.9, textAlign: 'center' },
    optionsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 15 },
    optionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', width: '45%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    optionIcon: { fontSize: 32, marginBottom: 8 },
    optionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
    syncStatus: {
        backgroundColor: '#FFF3E0',
        padding: 10,
        marginHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFB74D',
        marginBottom: 10,
        alignItems: 'center'
    },
    syncText: {
        color: '#E65100',
        fontWeight: 'bold',
        fontSize: 14
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 10
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary
    },
    seeAll: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500'
    },
    stackPreviewContainer: {
        height: 250,
        marginTop: 10,
    },
    workPreviewCard: {
        backgroundColor: 'rgba(255, 251, 240, 0.88)', // Slightly more opaque gold glass
        borderRadius: 24,
        padding: 20,
        width: SCREEN_WIDTH * 0.75, // Reduced width
        borderWidth: 1.5,
        borderColor: 'rgba(212, 175, 55, 0.5)',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    dayText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        letterSpacing: 0.5
    },
    goldDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: COLORS.primary,
        // Glowing Halo
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 6,
        elevation: 5
    },
    routineIconStyle: {
        fontSize: 32,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 18,
    },
    listContainer: {
        gap: 14
    },
    listItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        padding: 14,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    itemDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: COLORS.primary,
        marginRight: 12
    },
    itemText: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '600'
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center'
    },
    emptyText: {
        color: '#999',
        fontSize: 14
    }
});

export default HomeScreen;

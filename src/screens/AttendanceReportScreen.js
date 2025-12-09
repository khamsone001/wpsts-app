import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES } from '../constants/theme';
import * as Print from 'expo-print';
import routineService from '../services/routineService';
import * as Sharing from 'expo-sharing';
import routineAttendanceService from '../services/routineAttendanceService';

const AttendanceReportScreen = () => {
    const [totalUsers, setTotalUsers] = useState(0);
    const [allRoutines, setAllRoutines] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Date state
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); // First day of current month
    const [endDate, setEndDate] = useState(new Date()); // Today
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    useEffect(() => {
        if (startDate && endDate) {
            fetchReportData();
        }
    }, [startDate, endDate]);

    const onStartDateChange = (event, selectedDate) => {
        setShowStartPicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
            // If start date is after end date, update end date to match start date
            if (selectedDate > endDate) { // This logic seems fine, no translation needed.
                setEndDate(selectedDate);
            }
        }
    };

    const onEndDateChange = (event, selectedDate) => {
        setShowEndPicker(false);
        if (selectedDate) {
            // Ensure end date is not before start date
            if (selectedDate < startDate) { // This logic seems fine, no translation needed.
                Alert.alert('ແຈ້ງເຕືອນ', 'ວັນທີสิ้นສຸດຕ້ອງບໍ່ກ່ອນວັນທີເລີ່ມຕົ້ນ');
                return;
            }
            setEndDate(selectedDate);
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('lo-LA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const fetchReportData = async () => {
        setLoading(true);
        try {
            // Fetch all data concurrently
            const [reportResult, routinesResult] = await Promise.all([
                routineAttendanceService.getAttendanceReport(startDate, endDate),
                routineService.getAllRoutines() // Fetch all routines
            ]);

            const { totalUsers, report: processedData } = reportResult;

            setAllRoutines(routinesResult); // Store all routines

            // Set total users
            setTotalUsers(totalUsers);

            // Filter and sort the report data
            const filteredData = processedData
                .filter(user => user.totalAbsences > 0)
                .sort((a, b) => b.totalAbsences - a.totalAbsences);

            setReportData(filteredData);
        } catch (error) {
            console.error('Error fetching report data:', error);
            Alert.alert('ຜິດພາດ', 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນລາຍງານໄດ້');
        }
        setLoading(false);
    };

    const getRoutineNameById = (routineId) => {
        const routine = allRoutines.find(r => r.id === routineId);
        return routine ? routine.name : routineId;
    };

    const getDateRangeLabel = () => {
        if (!startDate || !endDate) return '';

        const startStr = startDate.toLocaleDateString('lo-LA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const endStr = endDate.toLocaleDateString('lo-LA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `${startStr} - ${endStr}`;
    };

    const generateHTMLReport = () => {
        let detailsHTML = '';
        reportData.forEach((user, index) => {
            detailsHTML += `
                <div style="page-break-inside: avoid; margin-bottom: 20px;">
                    <h3>${index + 1}. ${user.name}</h3>
                    <p><strong>ຈຳນວນຄັ້ງທີ່ຂາດທັງໝົດ:</strong> ${user.totalAbsences} ຄັ້ງ</p>
                    
                    <h4>ແຍກຕາມກິດຈະວັດ:</h4>
                    <ul>
                        ${Object.entries(user.routineBreakdown).map(([routineId, count]) =>
                count > 0
                    ? `<li>${getRoutineNameById(routineId)}: ${count} ຄັ້ງ</li>`
                    : ''
            ).join('')}
                    </ul>
                    
                    <h4>ລາຍລະອຽດການຂາດ:</h4>
                    <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f0f0f0;">
                                <th>ວັນທີ</th>
                                <th>ກິດຈະວັດ</th>
                                <th>ໝາຍເຫດ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${user.absenceDetails.map(detail => `
                                <tr>
                                    <td>${detail.day}</td>
                                    <td>${getRoutineNameById(detail.routine)}</td>
                                    <td>${detail.note}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>ລາຍງານສະຫຼຸບການຂາດ</title>
                <style>
                    body {
                        font-family: 'Sarabun', 'Arial', sans-serif;
                        padding: 20px;
                        font-size: 14px;
                    }
                    h1 {
                        text-align: center;
                        color: #333;
                        border-bottom: 2px solid #333;
                        padding-bottom: 10px;
                    }
                    h2 {
                        color: #666;
                        margin-top: 20px;
                    }
                    table {
                        width: 100%;
                        margin: 10px 0;
                    }
                    th {
                        background-color: #f0f0f0;
                        font-weight: bold;
                        text-align: left;
                    }
                    td, th {
                        padding: 8px;
                        border: 1px solid #ddd;
                    }
                    .summary {
                        background-color: #f9f9f9;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <h1>ລາຍງານສະຫຼຸບການຂາດ</h1>
                <h2>ຊ່ວງເວລາ: ${getDateRangeLabel()}</h2>
                
                <div class="summary">
                    <p><strong>ຈຳນວນຜູ້ໃຊ້ທັງໝົດ:</strong> ${totalUsers} ອົງ/ຮູບ</p>
                    <p><strong>ຈຳນວນຜູ້ທີ່ມີການຂາດ:</strong> ${reportData.length} ອົງ/ຮູບ</p>
                    <p><strong>ຈຳນວນຄັ້ງທີ່ຂາດທັງໝົດ:</strong> ${reportData.reduce((sum, u) => sum + u.totalAbsences, 0)} ຄັ້ງ</p>
                </div>

                <h2>ລາຍລະອຽດການຂາດແຕ່ລະອົງ/ຮູບ</h2>
                ${detailsHTML}
            </body>
            </html>
        `;
    };

    const handleDownloadPDF = async () => {
        try {
            const html = generateHTMLReport();
            const { uri } = await Print.printToFileAsync({ html });

            Alert.alert(
                'ສຳເລັດ',
                'ສ້າງ PDF ຮຽບຮ້ອຍແລ້ວ',
                [
                    {
                        text: 'ແບ່ງປັນ',
                        onPress: () => sharePDF(uri)
                    },
                    { text: 'ຕົກລົງ' }
                ]
            );
        } catch (error) {
            console.error('Error generating PDF:', error);
            Alert.alert('ຜິດພາດ', 'ບໍ່ສາມາດສ້າງ PDF ໄດ້');
        }
    };

    const handlePrintPDF = async () => {
        try {
            const html = generateHTMLReport();
            await Print.printAsync({ html });
        } catch (error) {
            console.error('Error printing PDF:', error);
            Alert.alert('ຜິດພາດ', 'ບໍ່ສາມາດພິມ PDF ໄດ້');
        }
    };

    const sharePDF = async (uri) => {
        try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert('ຜິດພາດ', 'ບໍ່ສາມາດແບ່ງປັນໄຟລ໌ໄດ້ໃນອຸປະກອນນີ້');
            }
        } catch (error) {
            console.error('Error sharing PDF:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>ກຳລັງໂຫຼດຂໍ້ມູນ...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ລາຍງານສະຫຼຸບການຂາດ</Text>
                <Text style={styles.headerSubtitle}>{getDateRangeLabel()}</Text>
            </View>

            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>ເລືອກຊ່ວງເວລາ:</Text>
                <View style={styles.datePickerContainer}>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowStartPicker(true)}
                    >
                        <Text style={styles.dateLabel}>ເລີ່ມຕົ້ນ</Text>
                        <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                    </TouchableOpacity>

                    <Text style={styles.dateSeparator}>ถึง</Text>

                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowEndPicker(true)}
                    >
                        <Text style={styles.dateLabel}>ສິ້ນສຸດ</Text>
                        <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                    </TouchableOpacity>
                </View>

                {showStartPicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display="default"
                        onChange={onStartDateChange}
                        maximumDate={new Date()}
                    />
                )}

                {showEndPicker && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display="default"
                        onChange={onEndDateChange}
                        minimumDate={startDate}
                        maximumDate={new Date()}
                    />
                )}
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>ຈຳນວນຜູ້ໃຊ້ທັງໝົດ: {totalUsers} ອົງ/ຮູບ</Text>
                <Text style={styles.summaryText}>ຈຳນວນຜູ້ທີ່ມີການຂາດ: {reportData.length} ອົງ/ຮູບ</Text>
                <Text style={styles.summaryText}>
                    ຈຳນວນຄັ້ງທີ່ຂາດທັງໝົດ: {reportData.reduce((sum, u) => sum + u.totalAbsences, 0)} ຄັ້ງ
                </Text>
            </View>

            <FlatList
                data={reportData}
                keyExtractor={(item) => item.uid}
                renderItem={({ item: user, index }) => (
                    <View style={styles.userCard}>
                        <Text style={styles.userName}>{index + 1}. {user.name}</Text>
                        <Text style={styles.totalAbsences}>ຂາດທັງໝົດ: {user.totalAbsences} ຄັ້ງ</Text>

                        <Text style={styles.sectionTitle}>ແຍກຕາມກິດຈະວັດ:</Text>
                        <View style={styles.routineGrid}>
                            {Object.entries(user.routineBreakdown).map(([routine, count]) => (
                                count > 0 && (
                                    <View key={routine} style={styles.routineItem} >
                                        <Text style={styles.routineText}>{getRoutineNameById(routine)}: {count}</Text>
                                    </View>
                                )
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>ລາຍລະອຽດການຂາດ:</Text>
                        {user.absenceDetails.map((detail, idx) => (
                            <View key={idx} style={styles.detailRow}>
                                <Text style={styles.detailText}>
                                    ວັນທີ {detail.day} | {getRoutineNameById(detail.routine)}
                                </Text>
                                {detail.note !== '-' && (
                                    <Text style={styles.noteText}>ໝາຍເຫດ: {detail.note}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}
                style={styles.reportList}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPDF}>
                    <Text style={styles.buttonText}>📥 ດາວໂຫຼດ PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.printButton} onPress={handlePrintPDF}>
                    <Text style={styles.buttonText}>🖨️ ພິມ PDF</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: COLORS.text,
    },
    header: {
        backgroundColor: COLORS.primary,
        padding: 20,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.secondary,
        opacity: 0.9,
        marginTop: 5,
    },
    filterContainer: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text,
        marginBottom: 10,
    },
    datePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    dateSeparator: {
        marginHorizontal: 10,
        color: '#666',
        fontWeight: 'bold',
    },
    summaryCard: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        margin: 10,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    summaryText: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 5,
    },
    reportList: {
        flex: 1,
        padding: 10,
    },
    userCard: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 5,
    },
    totalAbsences: {
        fontSize: 16,
        color: '#d32f2f',
        fontWeight: '600',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 10,
        marginBottom: 5,
    },
    routineGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    routineItem: {
        backgroundColor: '#e3f2fd',
        padding: 8,
        borderRadius: 5,
        marginRight: 5,
        marginBottom: 5,
    },
    routineText: {
        fontSize: 12,
        color: '#1976d2',
        fontWeight: '500',
    },
    detailRow: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 5,
        marginBottom: 5,
    },
    detailText: {
        fontSize: 13,
        color: COLORS.text,
    },
    noteText: {
        fontSize: 12,
        color: '#666',
        marginTop: 3,
        fontStyle: 'italic',
    },
    buttonContainer: {
        flexDirection: 'row',
        padding: 10,
        gap: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    downloadButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    printButton: {
        flex: 1,
        backgroundColor: '#4caf50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AttendanceReportScreen;

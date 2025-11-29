/**
 * Attendance Merger Utility
 * Merges multiple admin attendance records into a single consolidated view
 */

/**
 * Merge attendance records from multiple admins
 * @param {Object} adminRecords - Object with adminId as keys, each containing user attendance records
 * @returns {Object} Merged attendance records
 */
export const mergeAdminRecords = (adminRecords) => {
    if (!adminRecords || Object.keys(adminRecords).length === 0) {
        return {};
    }

    const merged = {};
    const timestamps = {}; // Track timestamps for note priority

    // Iterate through each admin's records
    Object.entries(adminRecords).forEach(([adminId, adminData]) => {
        if (!adminData) return;

        // Iterate through each user in this admin's records
        Object.entries(adminData).forEach(([userId, userDays]) => {
            if (!userDays) return;

            // Initialize user record if not exists
            if (!merged[userId]) {
                merged[userId] = {};
                timestamps[userId] = {};
            }

            // Iterate through each day
            Object.entries(userDays).forEach(([day, dayData]) => {
                if (!dayData) return;

                const currentTimestamp = dayData.timestamp || 0;
                const existingTimestamp = timestamps[userId][day] || Infinity;

                // If this is the first record for this day, or if marked as absent
                if (!merged[userId][day] || dayData.status === 'absent') {
                    // If multiple admins mark as absent, keep the earliest note
                    if (dayData.status === 'absent') {
                        if (!merged[userId][day] || merged[userId][day].status !== 'absent') {
                            // First absence record
                            merged[userId][day] = {
                                status: 'absent',
                                note: dayData.note || '',
                                markedBy: adminId,
                                timestamp: currentTimestamp
                            };
                            timestamps[userId][day] = currentTimestamp;
                        } else if (currentTimestamp < existingTimestamp) {
                            // Earlier absence record - update note
                            merged[userId][day].note = dayData.note || '';
                            merged[userId][day].markedBy = adminId;
                            merged[userId][day].timestamp = currentTimestamp;
                            timestamps[userId][day] = currentTimestamp;
                        }
                    } else if (!merged[userId][day]) {
                        // Present record, only if no record exists yet
                        merged[userId][day] = {
                            status: 'present',
                            note: '',
                            markedBy: adminId,
                            timestamp: currentTimestamp
                        };
                        timestamps[userId][day] = currentTimestamp;
                    }
                }
            });
        });
    });

    return merged;
};

/**
 * Get the first (earliest) note for a specific user and day
 * @param {Object} adminRecords - All admin records
 * @param {string} userId - User ID
 * @param {number} day - Day number
 * @returns {string} First note found
 */
export const getFirstNote = (adminRecords, userId, day) => {
    let earliestNote = '';
    let earliestTimestamp = Infinity;

    Object.values(adminRecords).forEach(adminData => {
        const dayData = adminData?.[userId]?.[day];
        if (dayData?.note && dayData.timestamp < earliestTimestamp) {
            earliestNote = dayData.note;
            earliestTimestamp = dayData.timestamp;
        }
    });

    return earliestNote;
};

/**
 * Update merged records in Firestore format
 * @param {Object} adminRecords - All admin records
 * @returns {Object} Merged records ready for Firestore
 */
export const updateMergedRecords = (adminRecords) => {
    return mergeAdminRecords(adminRecords);
};

/**
 * Check if a user is marked absent by any admin on a specific day
 * @param {Object} adminRecords - All admin records
 * @param {string} userId - User ID
 * @param {number} day - Day number
 * @returns {boolean} True if marked absent by any admin
 */
export const isAbsentByAnyAdmin = (adminRecords, userId, day) => {
    return Object.values(adminRecords).some(adminData =>
        adminData?.[userId]?.[day]?.status === 'absent'
    );
};

/**
 * Get list of admins who marked a user absent on a specific day
 * @param {Object} adminRecords - All admin records
 * @param {string} userId - User ID
 * @param {number} day - Day number
 * @returns {Array} Array of admin IDs
 */
export const getAdminsWhoMarkedAbsent = (adminRecords, userId, day) => {
    const admins = [];

    Object.entries(adminRecords).forEach(([adminId, adminData]) => {
        if (adminData?.[userId]?.[day]?.status === 'absent') {
            admins.push(adminId);
        }
    });

    return admins;
};

/**
 * Selects personnel for external work based on rules.
 * 
 * Rules:
 * 1. Filter by Class (M/N).
 * 2. Sort by Seniority (Work Age) descending.
 * 3. Iterate:
 *    - Skill >= 50: Select.
 *    - Skill < 50: Check skip count.
 *      - If count < 3: Skip, increment count.
 *      - If count == 3: Select, reset count.
 * 
 * @param {Array} users - List of all users.
 * @param {number} countM - Required number of Class M.
 * @param {number} countN - Required number of Class N.
 * @returns {Object} { selected: Array<User>, updatedUsers: Array<User> }
 */
export const selectPersonnelAuto = (users, countM, countN) => {
    console.log('=== AUTO SELECTION START ===');
    console.log('Users received:', users.length);
    console.log('Count M:', countM, 'Count N:', countN);

    const selected = [];
    const updatedUsersMap = new Map(); // To track updates to skip counts

    // Helper to process a specific class
    const processClass = (targetClass, count) => {
        console.log(`\nProcessing Class ${targetClass}, need ${count} people`);

        // Filter and Sort by Work Age (Descending)
        let candidates = users.filter(u => {
            const userClass = u.personalInfo?.class;
            const match = userClass === targetClass;
            if (!match && userClass) {
                console.log(`User ${u.personalInfo?.name || u.email} is class ${userClass}, not ${targetClass}`);
            }
            return match;
        });

        console.log(`Found ${candidates.length} candidates for Class ${targetClass}`);

        candidates.sort((a, b) => (b.history?.workAge || 0) - (a.history?.workAge || 0));

        let selectedCount = 0;

        for (const user of candidates) {
            if (selectedCount >= count) break;

            const skill = user.workInfo?.skillLevel || 0;
            let skipCount = user.workInfo?.lowSkillSkipCount || 0;
            let shouldSelect = false;
            let newSkipCount = skipCount;

            if (skill >= 50) {
                shouldSelect = true;
                console.log(`✓ ${user.personalInfo?.name}: Skill ${skill} >= 50, SELECTED`);
            } else {
                if (skipCount < 3) {
                    shouldSelect = false;
                    newSkipCount = skipCount + 1;
                    console.log(`✗ ${user.personalInfo?.name}: Skill ${skill} < 50, skip count ${skipCount} -> ${newSkipCount}, SKIPPED`);
                } else {
                    shouldSelect = true;
                    newSkipCount = 0;
                    console.log(`✓ ${user.personalInfo?.name}: Skill ${skill} < 50, but skip count = 3, SELECTED & RESET`);
                }
            }

            // Track updates if state changed
            if (newSkipCount !== skipCount) {
                updatedUsersMap.set(user.uid, { ...user, workInfo: { ...user.workInfo, lowSkillSkipCount: newSkipCount } });
            }

            if (shouldSelect) {
                selected.push(user);
                selectedCount++;
            }
        }

        console.log(`Selected ${selectedCount} out of ${count} needed for Class ${targetClass}`);
    };

    processClass('M', countM);
    processClass('N', countN);

    // Merge updates back into a full user list (mock persistence)
    const updatedUsers = users.map(u => updatedUsersMap.get(u.uid) || u);

    console.log('=== SELECTION COMPLETE ===');
    console.log('Total selected:', selected.length);
    console.log('Selected users:', selected.map(u => u.personalInfo?.name || u.email));

    return { selected, updatedUsers };
};

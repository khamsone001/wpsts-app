// Logic copied here for testing purposes to avoid ES6 module issues with Node
const selectPersonnelAuto = (users, countM, countN) => {
    const selected = [];
    const updatedUsersMap = new Map(); // To track updates to skip counts

    // Helper to process a specific class
    const processClass = (targetClass, count) => {
        // Filter and Sort by Work Age (Descending)
        let candidates = users.filter(u => u.personalInfo.class === targetClass);
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
            } else {
                if (skipCount < 3) {
                    shouldSelect = false;
                    newSkipCount = skipCount + 1;
                } else {
                    shouldSelect = true;
                    newSkipCount = 0;
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
    };

    processClass('M', countM);
    processClass('N', countN);

    // Merge updates back into a full user list (mock persistence)
    const updatedUsers = users.map(u => updatedUsersMap.get(u.uid) || u);

    return { selected, updatedUsers };
};

// Mock Users for testing
const mockUsers = [
    { uid: '1', personalInfo: { class: 'M' }, workInfo: { skillLevel: 40, lowSkillSkipCount: 0 }, history: { workAge: 10 } }, // Low skill
    { uid: '2', personalInfo: { class: 'M' }, workInfo: { skillLevel: 60, lowSkillSkipCount: 0 }, history: { workAge: 5 } },  // High skill
    { uid: '3', personalInfo: { class: 'M' }, workInfo: { skillLevel: 40, lowSkillSkipCount: 1 }, history: { workAge: 8 } }, // Low skill, skip 1
    { uid: '4', personalInfo: { class: 'M' }, workInfo: { skillLevel: 40, lowSkillSkipCount: 3 }, history: { workAge: 7 } }, // Low skill, skip 3 (Should pick)
];

console.log('--- Test 1: Select 2 Class M ---');
// Expected: User 2 (High skill), User 4 (Skip count 3 -> Pick)
// User 1 (Low skill, count 0 -> Skip, count 1)
// User 3 (Low skill, count 1 -> Skip, count 2)

const result = selectPersonnelAuto(mockUsers, 2, 0);

console.log('Selected IDs:', result.selected.map(u => u.uid));
console.log('Updated Users Skip Counts:');
result.updatedUsers.forEach(u => {
    console.log(`User ${u.uid}: ${u.workInfo.lowSkillSkipCount}`);
});

// Verification
const selectedIds = result.selected.map(u => u.uid);
if (selectedIds.includes('2') && selectedIds.includes('4') && !selectedIds.includes('1') && !selectedIds.includes('3')) {
    console.log('✅ Test Passed');
} else {
    console.log('❌ Test Failed');
}

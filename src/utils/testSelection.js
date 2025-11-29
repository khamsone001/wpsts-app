const { selectPersonnelAuto } = require('./selectionLogic');

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

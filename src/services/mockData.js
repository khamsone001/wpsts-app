export const MOCK_USERS = [
    {
        uid: 'user_super_admin',
        email: 'super@wpsts.com',
        password: 'password',
        role: 'super_admin',
        personalInfo: {
            name: 'Super Admin User',
            age: 40,
            class: 'M',
        },
        workInfo: {
            position: 'Director',
            skillLevel: 100,
            lowSkillSkipCount: 0,
        },
        history: {
            workAge: 10,
        }
    },
    {
        uid: 'user_manager',
        email: 'manager@wpsts.com',
        password: 'password',
        role: 'manager',
        personalInfo: {
            name: 'Manager User',
            age: 35,
            class: 'M',
        },
        workInfo: {
            position: 'Manager',
            skillLevel: 80,
            lowSkillSkipCount: 0,
        },
        history: {
            workAge: 5,
        }
    },
    {
        uid: 'user_admin',
        email: 'admin@wpsts.com',
        password: 'password',
        role: 'admin',
        personalInfo: {
            name: 'Admin User',
            age: 30,
            class: 'N',
        },
        workInfo: {
            position: 'Admin Staff',
            skillLevel: 60,
            lowSkillSkipCount: 0,
        },
        history: {
            workAge: 3,
        }
    },
    {
        uid: 'user_general_1',
        email: 'user1@wpsts.com',
        password: 'password',
        role: 'user',
        personalInfo: {
            name: 'General User 1',
            age: 25,
            class: 'N',
        },
        workInfo: {
            position: 'Staff',
            skillLevel: 40, // Low skill
            lowSkillSkipCount: 0,
        },
        history: {
            workAge: 1,
        }
    },
    {
        uid: 'user_general_2',
        email: 'user2@wpsts.com',
        password: 'password',
        role: 'user',
        personalInfo: {
            name: 'General User 2',
            age: 28,
            class: 'N',
        },
        workInfo: {
            position: 'Staff',
            skillLevel: 70,
            lowSkillSkipCount: 0,
        },
        history: {
            workAge: 2,
        }
    }
];

export const MOCK_ROUTINES = [
    { id: '1', type: 'A', name: 'Routine A' },
    { id: '2', type: 'B', name: 'Routine B' },
    { id: '3', type: 'C', name: 'Routine C' },
    { id: '4', type: 'E', name: 'Routine E' },
];

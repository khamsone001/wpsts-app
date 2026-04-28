export const normalizeUserData = (user) => {
    if (!user) return null;
    
    const normalized = { ...user };
    
    normalized.personalInfo = {
        firstName: user.first_name || user.personalInfo?.firstName || '',
        lastName: user.last_name || user.personalInfo?.lastName || '',
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        nickname: user.nickname || user.personalInfo?.nickname || '',
        age: user.age || user.personalInfo?.age || 0,
        class: user.class || user.personalInfo?.class || 'N',
        currentAddress: {
            house: user.address_house || user.personalInfo?.currentAddress?.house || '',
            city: user.address_city || user.personalInfo?.currentAddress?.city || '',
            district: user.address_district || user.personalInfo?.currentAddress?.district || ''
        }
    };
    
    normalized.history = {
        workAge: user.work_age || user.history?.workAge || 0,
        birthDate: user.birth_date || user.history?.birthDate || '',
        placeOfBirth: {
            house: user.birth_place_house || user.history?.placeOfBirth?.house || '',
            city: user.birth_place_city || user.history?.placeOfBirth?.city || '',
            district: user.birth_place_district || user.history?.placeOfBirth?.district || ''
        },
        race: user.race || user.history?.race || '',
        nationality: user.nationality || user.history?.nationality || '',
        tribe: user.tribe || user.history?.tribe || '',
        education: user.education || user.history?.education || '',
        classN: {
            entryDate: user.class_n_entry_date || user.history?.classN?.entryDate || '',
            location: {
                house: user.class_n_location_house || user.history?.classN?.location?.house || '',
                city: user.class_n_location_city || user.history?.classN?.location?.city || '',
                district: user.class_n_location_district || user.history?.classN?.location?.district || ''
            },
            issuerName: user.class_n_issuer_name || user.history?.classN?.issuerName || '',
            idCard: user.class_n_id_card || user.history?.classN?.idCard || '',
            totalWorkAge: user.class_n_total_work_age || user.history?.classN?.totalWorkAge || 0
        },
        classM: {
            entryDate: user.class_m_entry_date || user.history?.classM?.entryDate || '',
            location: {
                house: user.class_m_location_house || user.history?.classM?.location?.house || '',
                city: user.class_m_location_city || user.history?.classM?.location?.city || '',
                district: user.class_m_location_district || user.history?.classM?.location?.district || ''
            },
            issuerName: user.class_m_issuer_name || user.history?.classM?.issuerName || '',
            idCard: user.class_m_id_card || user.history?.classM?.idCard || '',
            totalWorkAge: user.class_m_total_work_age || user.history?.classM?.totalWorkAge || 0
        }
    };
    
    normalized.family = {
        father: {
            firstName: user.father_first_name || user.family?.father?.firstName || '',
            lastName: user.father_last_name || user.family?.father?.lastName || '',
            age: user.father_age || user.family?.father?.age || 0,
            placeOfBirth: {
                house: user.father_place_birth_house || user.family?.father?.placeOfBirth?.house || '',
                city: user.father_place_birth_city || user.family?.father?.placeOfBirth?.city || '',
                district: user.father_place_birth_district || user.family?.father?.placeOfBirth?.district || ''
            },
            currentAddress: {
                house: user.father_current_address_house || user.family?.father?.currentAddress?.house || '',
                city: user.father_current_address_city || user.family?.father?.currentAddress?.city || '',
                district: user.father_current_address_district || user.family?.father?.currentAddress?.district || ''
            }
        },
        mother: {
            firstName: user.mother_first_name || user.family?.mother?.firstName || '',
            lastName: user.mother_last_name || user.family?.mother?.lastName || '',
            age: user.mother_age || user.family?.mother?.age || 0,
            placeOfBirth: {
                house: user.mother_place_birth_house || user.family?.mother?.placeOfBirth?.house || '',
                city: user.mother_place_birth_city || user.family?.mother?.placeOfBirth?.city || '',
                district: user.mother_place_birth_district || user.family?.mother?.placeOfBirth?.district || ''
            },
            currentAddress: {
                house: user.mother_current_address_house || user.family?.mother?.currentAddress?.house || '',
                city: user.mother_current_address_city || user.family?.mother?.currentAddress?.city || '',
                district: user.mother_current_address_district || user.family?.mother?.currentAddress?.district || ''
            }
        }
    };
    
    normalized.photoURL = user.photo_url || user.photoURL || '';
    
    normalized.workInfo = {
        skillLevel: user.skill_level || user.workInfo?.skillLevel || 0,
        lowSkillSkipCount: user.low_skill_skip_count || user.workInfo?.lowSkillSkipCount || 0
    };
    
    return normalized;
};
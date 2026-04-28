import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform } from 'react-native';
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { uploadImageAsync } from '../services/uploadService';

const EditProfileScreen = ({ navigation }) => {
    const { user, updateUserProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [imageUri, setImageUri] = useState(null);

    // General Info
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nickname, setNickname] = useState('');
    const [age, setAge] = useState('');
    const [workAge, setWorkAge] = useState('');

    // Current Address
    const [curHouse, setCurHouse] = useState('');
    const [curCity, setCurCity] = useState('');
    const [curDistrict, setCurDistrict] = useState('');

    // Personal History
    const [birthDate, setBirthDate] = useState(new Date());
    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);

    // Place of Birth
    const [pobHouse, setPobHouse] = useState('');
    const [pobCity, setPobCity] = useState('');
    const [pobDistrict, setPobDistrict] = useState('');

    // Ethnicity/Nationality
    const [race, setRace] = useState('');
    const [nationality, setNationality] = useState('');
    const [tribe, setTribe] = useState('');
    const [education, setEducation] = useState('');

    // Father Info
    const [fatherFirstName, setFatherFirstName] = useState('');
    const [fatherLastName, setFatherLastName] = useState('');
    const [fatherAge, setFatherAge] = useState('');
    const [fatherPobHouse, setFatherPobHouse] = useState('');
    const [fatherPobCity, setFatherPobCity] = useState('');
    const [fatherPobDistrict, setFatherPobDistrict] = useState('');
    const [fatherCurHouse, setFatherCurHouse] = useState('');
    const [fatherCurCity, setFatherCurCity] = useState('');
    const [fatherCurDistrict, setFatherCurDistrict] = useState('');

    // Mother Info
    const [motherFirstName, setMotherFirstName] = useState('');
    const [motherLastName, setMotherLastName] = useState('');
    const [motherAge, setMotherAge] = useState('');
    const [motherPobHouse, setMotherPobHouse] = useState('');
    const [motherPobCity, setMotherPobCity] = useState('');
    const [motherPobDistrict, setMotherPobDistrict] = useState('');
    const [motherCurHouse, setMotherCurHouse] = useState('');
    const [motherCurCity, setMotherCurCity] = useState('');
    const [motherCurDistrict, setMotherCurDistrict] = useState('');

    // Class N History
    const [nEntryDate, setNEntryDate] = useState(new Date());
    const [showNEntryPicker, setShowNEntryPicker] = useState(false);
    const [nHouse, setNHouse] = useState('');
    const [nCity, setNCity] = useState('');
    const [nDistrict, setNDistrict] = useState('');
    const [nIssuer, setNIssuer] = useState('');
    const [nIdCard, setNIdCard] = useState('');
    const [nTotalWorkAge, setNTotalWorkAge] = useState('');

    // Class M History
    const [mEntryDate, setMEntryDate] = useState(new Date());
    const [showMEntryPicker, setShowMEntryPicker] = useState(false);
    const [mHouse, setMHouse] = useState('');
    const [mCity, setMCity] = useState('');
    const [mDistrict, setMDistrict] = useState('');
    const [mIssuer, setMIssuer] = useState('');
    const [mIdCard, setMIdCard] = useState('');
    const [mTotalWorkAge, setMTotalWorkAge] = useState('');

    useEffect(() => {
        if (user) {
            // Load General - support both flat (Supabase) and nested (MongoDB)
            setFirstName(user.first_name || user.personalInfo?.firstName || user.personalInfo?.name?.split(' ')[0] || '');
            setLastName(user.last_name || user.personalInfo?.lastName || user.personalInfo?.name?.split(' ').slice(1).join(' ') || '');
            setNickname(user.nickname || user.personalInfo?.nickname || '');
            setAge((user.age || user.personalInfo?.age || '').toString());
            setWorkAge((user.work_age || user.history?.workAge || '').toString());
            setImageUri(user.photo_url || user.photoURL || null);

            // Load Current Address
            setCurHouse(user.address_house || user.personalInfo?.currentAddress?.house || '');
            setCurCity(user.address_city || user.personalInfo?.currentAddress?.city || '');
            setCurDistrict(user.address_district || user.personalInfo?.currentAddress?.district || '');

            // Load Personal History
            const birthDateStr = user.birth_date || user.history?.birthDate;
            if (birthDateStr) setBirthDate(new Date(birthDateStr));
            setPobHouse(user.birth_place_house || user.history?.placeOfBirth?.house || '');
            setPobCity(user.birth_place_city || user.history?.placeOfBirth?.city || '');
            setPobDistrict(user.birth_place_district || user.history?.placeOfBirth?.district || '');
            setRace(user.race || user.history?.race || '');
            setNationality(user.nationality || user.history?.nationality || '');
            setTribe(user.tribe || user.history?.tribe || '');
            setEducation(user.education || user.history?.education || '');

            // Load Father Info
            setFatherFirstName(user.father_first_name || user.family?.father?.firstName || '');
            setFatherLastName(user.father_last_name || user.family?.father?.lastName || '');
            setFatherAge((user.father_age || user.family?.father?.age || '').toString());
            setFatherPobHouse(user.father_place_birth_house || user.family?.father?.placeOfBirth?.house || '');
            setFatherPobCity(user.father_place_birth_city || user.family?.father?.placeOfBirth?.city || '');
            setFatherPobDistrict(user.father_place_birth_district || user.family?.father?.placeOfBirth?.district || '');
            setFatherCurHouse(user.father_current_address_house || user.family?.father?.currentAddress?.house || '');
            setFatherCurCity(user.father_current_address_city || user.family?.father?.currentAddress?.city || '');
            setFatherCurDistrict(user.father_current_address_district || user.family?.father?.currentAddress?.district || '');

            // Load Mother Info
            setMotherFirstName(user.mother_first_name || user.family?.mother?.firstName || '');
            setMotherLastName(user.mother_last_name || user.family?.mother?.lastName || '');
            setMotherAge((user.mother_age || user.family?.mother?.age || '').toString());
            setMotherPobHouse(user.mother_place_birth_house || user.family?.mother?.placeOfBirth?.house || '');
            setMotherPobCity(user.mother_place_birth_city || user.family?.mother?.placeOfBirth?.city || '');
            setMotherPobDistrict(user.mother_place_birth_district || user.family?.mother?.placeOfBirth?.district || '');
            setMotherCurHouse(user.mother_current_address_house || user.family?.mother?.currentAddress?.house || '');
            setMotherCurCity(user.mother_current_address_city || user.family?.mother?.currentAddress?.city || '');
            setMotherCurDistrict(user.mother_current_address_district || user.family?.mother?.currentAddress?.district || '');

            // Load Class N
            const nEntryDateStr = user.class_n_entry_date || user.history?.classN?.entryDate;
            if (nEntryDateStr) setNEntryDate(new Date(nEntryDateStr));
            setNHouse(user.class_n_location_house || user.history?.classN?.location?.house || '');
            setNCity(user.class_n_location_city || user.history?.classN?.location?.city || '');
            setNDistrict(user.class_n_location_district || user.history?.classN?.location?.district || '');
            setNIssuer(user.class_n_issuer_name || user.history?.classN?.issuerName || '');
            setNIdCard(user.class_n_id_card || user.history?.classN?.idCard || '');
            setNTotalWorkAge((user.class_n_total_work_age || user.history?.classN?.totalWorkAge || '').toString());

            // Load Class M
            const mEntryDateStr = user.class_m_entry_date || user.history?.classM?.entryDate;
            if (mEntryDateStr) setMEntryDate(new Date(mEntryDateStr));
            setMHouse(user.class_m_location_house || user.history?.classM?.location?.house || '');
            setMCity(user.class_m_location_city || user.history?.classM?.location?.city || '');
            setMDistrict(user.class_m_location_district || user.history?.classM?.location?.district || '');
            setMIssuer(user.class_m_issuer_name || user.history?.classM?.issuerName || '');
            setMIdCard(user.class_m_id_card || user.history?.classM?.idCard || '');
            setMTotalWorkAge((user.class_m_total_work_age || user.history?.classM?.totalWorkAge || '').toString());
        }
    }, [user]);

    const formatDate = (date) => {
        return date.toLocaleDateString('lo-LA', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleSave = async () => {
        setLoading(true);

        let finalImageUri = user.photo_url || user.photoURL; // Start with existing URL

        // Check if a new image was selected (imageUri will be a local file path)
        if (imageUri && imageUri !== (user.photo_url || user.photoURL)) {
            try {
                const uploadResult = await uploadImageAsync(imageUri);
                finalImageUri = uploadResult.url;
            } catch (error) {
                setLoading(false);
                Alert.alert('Upload Failed', 'Could not upload new profile picture. Please try again.');
                return;
            }
        }

        const updatedData = {
            first_name: firstName,
            last_name: lastName,
            name: `${firstName} ${lastName}`,
            nickname,
            age: parseInt(age) || 0,
            work_age: parseInt(workAge) || 0,
            birth_date: birthDate.toISOString(),
            race,
            nationality,
            tribe,
            education,
            address_house: curHouse,
            address_city: curCity,
            address_district: curDistrict,
            birth_place_house: pobHouse,
            birth_place_city: pobCity,
            birth_place_district: pobDistrict,
            father_first_name: fatherFirstName,
            father_last_name: fatherLastName,
            father_age: parseInt(fatherAge) || 0,
            father_place_birth_house: fatherPobHouse,
            father_place_birth_city: fatherPobCity,
            father_place_birth_district: fatherPobDistrict,
            father_current_address_house: fatherCurHouse,
            father_current_address_city: fatherCurCity,
            father_current_address_district: fatherCurDistrict,
            mother_first_name: motherFirstName,
            mother_last_name: motherLastName,
            mother_age: parseInt(motherAge) || 0,
            mother_place_birth_house: motherPobHouse,
            mother_place_birth_city: motherPobCity,
            mother_place_birth_district: motherPobDistrict,
            mother_current_address_house: motherCurHouse,
            mother_current_address_city: motherCurCity,
            mother_current_address_district: motherCurDistrict,
            class_n_entry_date: nEntryDate.toISOString(),
            class_n_location_house: nHouse,
            class_n_location_city: nCity,
            class_n_location_district: nDistrict,
            class_n_issuer_name: nIssuer,
            class_n_id_card: nIdCard,
            class_n_total_work_age: parseInt(nTotalWorkAge) || 0,
            ...(user?.class === 'M' ? {
                class_m_entry_date: mEntryDate.toISOString(),
                class_m_location_house: mHouse,
                class_m_location_city: mCity,
                class_m_location_district: mDistrict,
                class_m_issuer_name: mIssuer,
                class_m_id_card: mIdCard,
                class_m_total_work_age: parseInt(mTotalWorkAge) || 0,
            } : {}),
            photo_url: finalImageUri
        };

        const result = await updateUserProfile(updatedData);
        setLoading(false);

        if (result.success) {
            Alert.alert('ສຳເລັດ', 'ອັບເດດໂປຣໄຟລ໌ສຳເລັດ');
            navigation.goBack();
        } else {
            Alert.alert('ຜິດພາດ', 'ບໍ່ສາມາດອັບເດດໂປຣໄຟລ໌ໄດ້: ' + result.error);
        }
    };

    const pickImage = async () => {
        const result = await launchImageLibraryAsync({
            mediaTypes: 'Images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>ແກ້ໄຂຂໍ້ມູນປະຫວັດ (Edit Profile)</Text>

                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarTouchable}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{firstName?.charAt(0) || 'U'}</Text>
                            </View>
                        )}
                        <View style={styles.changePhotoOverlay}>
                            <Text style={styles.changePhotoText}>ປ່ຽນຮູບພາບ</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* --- General Info --- */}
                <Text style={styles.sectionHeader}>1. ຂໍ້ມູນທົ່ວໄປ (General)</Text>
                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ຊື່ແທ້</Text>
                        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ນາມສະກຸນ</Text>
                        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ຊື່ຫຼິ້ນ</Text>
                        <TextInput style={styles.input} value={nickname} onChangeText={setNickname} />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ອາຍຸ</Text>
                        <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />
                    </View>
                </View>
                <Text style={styles.label}>ອາຍຸວັດສາ (ປີ)</Text>
                <TextInput style={styles.input} value={workAge} onChangeText={setWorkAge} keyboardType="numeric" />

                <Text style={styles.subHeader}>ທີ່ຢູ່ປັດຈຸບັນ (Current Address)</Text>
                <View style={styles.row}>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ບ້ານ" value={curHouse} onChangeText={setCurHouse} />
                    </View>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ເມືອງ" value={curCity} onChangeText={setCurCity} />
                    </View>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ແຂວງ" value={curDistrict} onChangeText={setCurDistrict} />
                    </View>
                </View>

                {/* --- Personal History --- */}
                <Text style={styles.sectionHeader}>2. ປະຫວັດສ່ວນຕົວ (Personal History)</Text>

                <Text style={styles.label}>ວັນເດືອນປີເກີດ</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowBirthDatePicker(true)}>
                    <Text>{formatDate(birthDate)}</Text>
                </TouchableOpacity>
                {showBirthDatePicker && (
                    <DateTimePicker
                        value={birthDate}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            setShowBirthDatePicker(false);
                            if (date) setBirthDate(date);
                        }}
                    />
                )}

                <Text style={styles.subHeader}>ສະຖານທີ່ເກີດ (Place of Birth)</Text>
                <View style={styles.row}>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ບ້ານ" value={pobHouse} onChangeText={setPobHouse} />
                    </View>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ເມືອງ" value={pobCity} onChangeText={setPobCity} />
                    </View>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ແຂວງ" value={pobDistrict} onChangeText={setPobDistrict} />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.thirdInput}>
                        <Text style={styles.label}>ເຊື້ອຊາດ</Text>
                        <TextInput style={styles.input} value={race} onChangeText={setRace} />
                    </View>
                    <View style={styles.thirdInput}>
                        <Text style={styles.label}>ສັນຊາດ</Text>
                        <TextInput style={styles.input} value={nationality} onChangeText={setNationality} />
                    </View>
                    <View style={styles.thirdInput}>
                        <Text style={styles.label}>ຊົນເຜົ່າ</Text>
                        <TextInput style={styles.input} value={tribe} onChangeText={setTribe} />
                    </View>
                </View>

                <Text style={styles.label}>ລະດັບການສຶກສາ</Text>
                <TextInput style={styles.input} value={education} onChangeText={setEducation} />

                {/* --- Family Info --- */}
                <Text style={styles.sectionHeader}>3. ຂໍ້ມູນຄອບຄົວ (Family Info)</Text>

                {/* Father */}
                <Text style={styles.subHeader}>ຂໍ້ມູນບິດາ (Father)</Text>
                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ຊື່ແທ້</Text>
                        <TextInput style={styles.input} value={fatherFirstName} onChangeText={setFatherFirstName} />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ນາມສະກຸນ</Text>
                        <TextInput style={styles.input} value={fatherLastName} onChangeText={setFatherLastName} />
                    </View>
                </View>
                <Text style={styles.label}>ອາຍຸ</Text>
                <TextInput style={styles.input} value={fatherAge} onChangeText={setFatherAge} keyboardType="numeric" />

                <Text style={styles.label}>ສະຖານທີ່ເກີດ (Place of Birth)</Text>
                <View style={styles.row}>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ບ້ານ" value={fatherPobHouse} onChangeText={setFatherPobHouse} />
                    </View>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ເມືອງ" value={fatherPobCity} onChangeText={setFatherPobCity} />
                    </View>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ແຂວງ" value={fatherPobDistrict} onChangeText={setFatherPobDistrict} />
                    </View>
                </View>

                <Text style={styles.label}>ທີ່ຢູ່ປັດຈຸບັນ (Current Address)</Text>
                <View style={styles.row}>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ບ້ານ" value={fatherCurHouse} onChangeText={setFatherCurHouse} />
                    </View>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ເມືອງ" value={fatherCurCity} onChangeText={setFatherCurCity} />
                    </View>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ແຂວງ" value={fatherCurDistrict} onChangeText={setFatherCurDistrict} />
                    </View>
                </View>

                {/* Mother */}
                <Text style={styles.subHeader}>ຂໍ້ມູນມານດາ (Mother)</Text>
                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ຊື່ແທ້</Text>
                        <TextInput style={styles.input} value={motherFirstName} onChangeText={setMotherFirstName} />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ນາມສະກຸນ</Text>
                        <TextInput style={styles.input} value={motherLastName} onChangeText={setMotherLastName} />
                    </View>
                </View>
                <Text style={styles.label}>ອາຍຸ</Text>
                <TextInput style={styles.input} value={motherAge} onChangeText={setMotherAge} keyboardType="numeric" />

                <Text style={styles.label}>ສະຖານທີ່ເກີດ (Place of Birth)</Text>
                <View style={styles.row}>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ບ້ານ" value={motherPobHouse} onChangeText={setMotherPobHouse} />
                    </View>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ເມືອງ" value={motherPobCity} onChangeText={setMotherPobCity} />
                    </View>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ແຂວງ" value={motherPobDistrict} onChangeText={setMotherPobDistrict} />
                    </View>
                </View>

                <Text style={styles.label}>ທີ່ຢູ່ປັດຈຸບັນ (Current Address)</Text>
                <View style={styles.row}>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ບ້ານ" value={motherCurHouse} onChangeText={setMotherCurHouse} />
                    </View>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ເມືອງ" value={motherCurCity} onChangeText={setMotherCurCity} />
                    </View>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ແຂວງ" value={motherCurDistrict} onChangeText={setMotherCurDistrict} />
                    </View>
                </View>

                {/* --- Class N History --- */}
                <Text style={styles.sectionHeader}>4. ບັນພະຊາເປັນສຳມະເນນ</Text>
                <Text style={styles.label}>ບວດເມື່ອວັນທີ່</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowNEntryPicker(true)}>
                    <Text>{formatDate(nEntryDate)}</Text>
                </TouchableOpacity>
                {showNEntryPicker && (
                    <DateTimePicker
                        value={nEntryDate}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            setShowNEntryPicker(false);
                            if (date) setNEntryDate(date);
                        }}
                    />
                )}

                               <Text style={styles.subHeader}>ສະຖານທີ່ (Location)</Text>
                <View style={styles.row}>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ບ້ານ" value={nHouse} onChangeText={setNHouse} />
                    </View>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ເມືອງ" value={nCity} onChangeText={setNCity} />
                    </View>
                    <View style={styles.thirdInput}>
                        <TextInput style={styles.input} placeholder="ແຂວງ" value={nDistrict} onChangeText={setNDistrict} />
                    </View>
                </View>

                <Text style={styles.label}>ພຣະອຸປະຊາ</Text>
                <TextInput style={styles.input} value={nIssuer} onChangeText={setNIssuer} />

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ປຶ້ມສຸດທິ</Text>
                        <TextInput style={styles.input} value={nIdCard} onChangeText={setNIdCard} keyboardType="numeric" />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ອາຍຸພັນສາລວມ (ພັນສາ)</Text>
                        <TextInput style={styles.input} value={nTotalWorkAge} onChangeText={setNTotalWorkAge} keyboardType="numeric" />
                    </View>
                </View>

                {/* --- Class M History (Conditional) --- */}
                {user?.class === 'M' && (
                    <>
                        <Text style={styles.sectionHeader}>5. ບັນພະຊາເປັນພະພິກຂຸ</Text>
                        <Text style={styles.label}>ບວດເມື່ອວັນທີ່</Text>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowMEntryPicker(true)}>
                            <Text>{formatDate(mEntryDate)}</Text>
                        </TouchableOpacity>
                        {showMEntryPicker && (
                            <DateTimePicker
                                value={mEntryDate}
                                mode="date"
                                display="default"
                                onChange={(event, date) => {
                                    setShowMEntryPicker(false);
                                    if (date) setMEntryDate(date);
                                }}
                            />
                        )}

                        <Text style={styles.subHeader}>ສະຖານທີ່ (Location)</Text>
                        <View style={styles.row}>
                            <View style={styles.thirdInput}>
                                <TextInput style={styles.input} placeholder="ບ້ານ" value={mHouse} onChangeText={setMHouse} />
                            </View>
                            <View style={styles.thirdInput}>
                                <TextInput style={styles.input} placeholder="ເມືອງ" value={mCity} onChangeText={setMCity} />
                            </View>
                            <View style={styles.thirdInput}>
                                <TextInput style={styles.input} placeholder="ແຂວງ" value={mDistrict} onChangeText={setMDistrict} />
                            </View>
                        </View>

                        <Text style={styles.label}>ພຣະອຸປະຊາ</Text>
                        <TextInput style={styles.input} value={mIssuer} onChangeText={setMIssuer} />

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>ປຶ້ມສຸດທິ</Text>
                                <TextInput style={styles.input} value={mIdCard} onChangeText={setMIdCard} keyboardType="numeric" />
                            </View>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>ອາຍຸພັນສາລວມ (ພັນສາ)</Text>
                                <TextInput style={styles.input} value={mTotalWorkAge} onChangeText={setMTotalWorkAge} keyboardType="numeric" />
                            </View>
                        </View>
                    </>
                )}

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                    <Text style={styles.saveButtonText}>{loading ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກຂໍ້ມູນ'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: SIZES.padding,
        backgroundColor: COLORS.background,
    },
    card: {
        backgroundColor: COLORS.secondary,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        elevation: 3,
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: 20,
        marginBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.goldLight,
        paddingBottom: 5,
    },
    subHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 10,
        marginBottom: 5,
    },
    label: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    halfInput: {
        flex: 1,
    },
    thirdInput: {
        flex: 1,
    },
    dateButton: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius,
        padding: 12,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    saveButtonText: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarTouchable: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarText: {
        fontSize: 40,
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    changePhotoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
    },
    changePhotoText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default EditProfileScreen;

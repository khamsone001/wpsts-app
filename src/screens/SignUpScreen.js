import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

const SignUpScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State for password visibility

    // New Fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nickname, setNickname] = useState('');
    const [age, setAge] = useState('');
    const [workAge, setWorkAge] = useState('');
    const [image, setImage] = useState(null); // State for profile image

    const [userClass, setUserClass] = useState('N'); // Default to N

    const { signup, isLoading } = useAuth();

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSignUp = async () => {
        if (!email || !password || !firstName || !lastName || !age) {
            Alert.alert('ຜິດພາດ', 'ກະລຸນາຕື່ມຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບຖ້ວນ');
            return;
        }

        // Initialize history with workAge
        const history = {
            workAge: parseInt(workAge) || 0
        };
        const userData = {
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            nickname,
            age: parseInt(age) || 0,
            class: userClass,
            history
        };
        // Pass the local imageUri to the signup function in AuthContext
        const result = await signup(email, password, userData, image);

        console.log('SignUp result:', result);

        if (result.success) {
            console.log('Navigating to Home...');
            // navigation.navigate('Home'); // RootNavigator will switch to AppStack automatically when user is set
        } else {
            Alert.alert('ລົງທະບຽນລົ້ມເຫຼວ', result.error || 'ມີບາງຢ່າງຜິດພາດ');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>ສ້າງບັນຊີ</Text>

                {/* Profile Image Picker */}
                <View style={styles.imageContainer}>
                    <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Ionicons name="camera" size={40} color={COLORS.gray} />
                                <Text style={styles.uploadText}>ເລືອກຮູບ</Text>
                            </View>
                        )}
                        <View style={styles.editIconContainer}>
                            <Ionicons name="pencil" size={16} color={COLORS.white} />
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>ຂໍ້ມູນທົ່ວໄປ</Text>

                <Text style={styles.label}>ອີເມວ *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="ປ້ອນອີເມວ"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text style={styles.label}>ລະຫັດຜ່ານ *</Text>
                <View style={styles.passwordWrapper}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="ປ້ອນລະຫັດຜ່ານ"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!isPasswordVisible}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={24}
                            color={COLORS.gray}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ຊື່ແທ້ *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ຊື່ແທ້"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ນາມສະກຸນ *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ນາມສະກຸນ"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>
                </View>

                <Text style={styles.label}>ຊື່ຫຼິ້ນ</Text>
                <TextInput
                    style={styles.input}
                    placeholder="ຊື່ຫຼິ້ນ"
                    value={nickname}
                    onChangeText={setNickname}
                />

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ອາຍຸ *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ອາຍຸ"
                            value={age}
                            onChangeText={setAge}
                            keyboardType="numeric"
                            maxLength={3}
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>ອາຍຸພັນສາ (ປີ)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ອາຍຸພັນສາ"
                            value={workAge}
                            onChangeText={setWorkAge}
                            keyboardType="numeric"
                            maxLength={3}
                        />
                    </View>
                </View>

                <Text style={styles.label}>Class</Text>
                <View style={styles.pickerContainer}>
                    <View style={styles.classSelector}>
                        <TouchableOpacity
                            style={[styles.classButton, userClass === 'M' && styles.classButtonActive]}
                            onPress={() => setUserClass('M')}
                        >
                            <Text style={[styles.classButtonText, userClass === 'M' && styles.classButtonTextActive]}>ພຣະ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.classButton, userClass === 'N' && styles.classButtonActive]}
                            onPress={() => setUserClass('N')}
                        >
                            <Text style={[styles.classButtonText, userClass === 'N' && styles.classButtonTextActive]}>ສ.ນ</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color={COLORS.secondary} />
                    ) : (
                        <Text style={styles.buttonText}>ລົງທະບຽນ</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.link}>ມີບັນຊີແລ້ວບໍ່? ເຂົ້າສູ່ລະບົບ</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SIZES.padding,
        backgroundColor: COLORS.background,
    },
    card: {
        backgroundColor: COLORS.secondary,
        padding: SIZES.padding * 2,
        borderRadius: SIZES.radius,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 20,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    imagePicker: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadText: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 5,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 15,
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
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
        marginBottom: 15,
        fontSize: 16,
        color: COLORS.text, // Explicitly set text color
    },
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius,
        marginBottom: 15,
        backgroundColor: COLORS.white, // Ensure background is white
    },
    passwordInput: {
        flex: 1,
        padding: 10,
        fontSize: 16,
        color: COLORS.text, // Explicitly set text color
    },
    eyeIcon: {
        padding: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    halfInput: {
        flex: 1,
    },
    pickerContainer: {
        marginBottom: 15,
    },
    classSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    classButton: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    classButtonActive: {
        backgroundColor: COLORS.primary,
    },
    classButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    classButtonTextActive: {
        color: COLORS.secondary,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    link: {
        marginTop: 15,
        color: COLORS.primary,
        textAlign: 'center',
    },
});

export default SignUpScreen;

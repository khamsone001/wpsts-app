import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState(''); // Changed from email to identifier
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // State for Remember Me
  const { login, isLoading } = useAuth();

  // Load saved credentials on mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedIdentifier = await AsyncStorage.getItem('login_identifier');
        const savedPassword = await AsyncStorage.getItem('login_password');
        if (savedIdentifier && savedPassword) {
          setIdentifier(savedIdentifier);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Failed to load credentials', error);
      }
    };
    loadCredentials();
  }, []);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('ຂໍ້ມູນບໍ່ຄົບຖ້ວນ', 'ກະລຸນາປ້ອນອີເມວ/ຊື່ ແລະ ລະຫັດຜ່ານ.');
      return;
    }
    try {
      await login(identifier, password);
      
      // Handle Remember Me
      if (rememberMe) {
        await AsyncStorage.setItem('login_identifier', identifier);
        await AsyncStorage.setItem('login_password', password);
      } else {
        await AsyncStorage.removeItem('login_identifier');
        await AsyncStorage.removeItem('login_password');
      }

      // Navigation will be handled by the RootNavigator
    } catch (error) {
      Alert.alert('ເຂົ້າສູ່ລະບົບຜິດພາດ', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ເຂົ້າສູ່ລະບົບ</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>ອີເມວ ຫຼື ຊື່-ນາມສະກຸນ</Text>
        <TextInput
          style={styles.input}
          placeholder="ປ້ອນອີເມວ ຫຼື ຊື່-ນາມສະກຸນ"
          placeholderTextColor={COLORS.gray}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>ລະຫັດຜ່ານ</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="ປ້ອນລະຫັດຜ່ານຂອງທ່ານ"
            placeholderTextColor={COLORS.gray}
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
      </View>

      {/* Remember Me Checkbox */}
      <TouchableOpacity 
        style={styles.rememberMeContainer} 
        onPress={() => setRememberMe(!rememberMe)}
      >
        <Ionicons 
          name={rememberMe ? 'checkbox' : 'square-outline'} 
          size={24} 
          color={COLORS.primary} 
        />
        <Text style={styles.rememberMeText}>ຈົດຈຳຂ້ອຍໄວ້</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.loginButtonText}>ເຂົ້າສູ່ລະບົບ</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>
          ຍັງບໍ່ມີບັນຊີ? <Text style={styles.signUpLink}>ລົງທະບຽນ</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.lightWhite,
  },
  title: {
    ...FONTS.h1,
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  inputContainer: {
    marginBottom: SIZES.padding * 1.5,
  },
  label: {
    ...FONTS.body3,
    fontSize: 16,
    color: COLORS.dark,
    marginBottom: SIZES.base,
  },
  input: {
    ...FONTS.body3,
    fontSize: 16,
    height: 50,
    borderColor: COLORS.gray2,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.gray2,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    ...FONTS.body3,
    fontSize: 16,
  },
  eyeIcon: {
    padding: SIZES.base,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  rememberMeText: {
    ...FONTS.body3,
    fontSize: 16,
    color: COLORS.dark,
    marginLeft: SIZES.base,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.padding,
  },
  loginButtonText: {
    ...FONTS.h3,
    fontSize: 18,
    color: COLORS.white,
  },
  signUpText: {
    ...FONTS.body4,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SIZES.padding * 2,
    color: COLORS.dark,
  },
  signUpLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;

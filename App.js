import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import ExternalWorkScreen from './src/screens/ExternalWorkScreen';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from './src/constants/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

import MainTabNavigator from './src/navigation/MainTabNavigator';

import EditProfileScreen from './src/screens/EditProfileScreen';
import PersonnelListScreen from './src/screens/PersonnelListScreen';
import UserDetailScreen from './src/screens/UserDetailScreen';
import WorkDetailScreen from './src/screens/WorkDetailScreen';
import RoutineAttendanceScreen from './src/screens/RoutineAttendanceScreen';
import WorkScheduleScreen from './src/screens/WorkScheduleScreen';
import MembersListScreen from './src/screens/MembersListScreen';
import EditWorkScreen from './src/screens/EditWorkScreen';
import ActivitiesScreen from './src/screens/ActivitiesScreen';
import DocumentDetailScreen from './src/screens/DocumentDetailScreen';
import CreateDocumentScreen from './src/screens/CreateDocumentScreen';

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    <Stack.Screen
      name="ExternalWork"
      component={ExternalWorkScreen}
      options={{
        headerShown: true,
        title: 'ສ້າງກິດນິມົນ',
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.secondary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="PersonnelList" component={PersonnelListScreen} />
    <Stack.Screen
      name="UserDetail"
      component={UserDetailScreen}
      options={{
        headerShown: true,
        title: 'User Detail',
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.secondary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    <Stack.Screen name="WorkDetail" component={WorkDetailScreen} />
    <Stack.Screen name="RoutineAttendance" component={RoutineAttendanceScreen} />
    <Stack.Screen
      name="WorkSchedule"
      component={WorkScheduleScreen}
      options={{
        headerShown: true,
        title: 'ກິດນິມົນ',
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.secondary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    <Stack.Screen name="MembersList" component={MembersListScreen} />
    <Stack.Screen name="EditWork" component={EditWorkScreen} />
    <Stack.Screen
      name="Activities"
      component={ActivitiesScreen}
      options={{
        headerShown: true,
        title: 'ກິດຈະວັດ',
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.secondary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    <Stack.Screen
      name="DocumentDetail"
      component={DocumentDetailScreen}
      options={{
        headerShown: true,
        title: 'ເຂດກິດນິມົນ',
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.secondary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    <Stack.Screen
      name="CreateDocument"
      component={CreateDocumentScreen}
      options={{
        headerShown: true,
        title: 'ສ້າງ/ແກ້ໄຂເຂດ',
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.secondary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <SafeAreaView style={{ flex: 1, paddingTop: 0 }} edges={['left', 'right', 'bottom']}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

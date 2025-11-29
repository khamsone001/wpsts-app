import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MembersListScreen from '../screens/MembersListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DocumentsScreen from '../screens/DocumentsScreen';

import HomeScreen from '../screens/HomeScreen';

import { COLORS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';


const Tab = createMaterialTopTabNavigator();

const MainTabNavigator = () => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.secondary }} edges={['top']}>
            <Tab.Navigator
                screenOptions={{
                    tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
                    tabBarStyle: { backgroundColor: COLORS.secondary },
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: COLORS.text,
                    tabBarIndicatorStyle: { backgroundColor: COLORS.primary },
                }}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: 'ໜ້າຫຼັກ' }}
                />
                <Tab.Screen
                    name="Members"
                    component={MembersListScreen}
                    options={{ title: 'ພຣະ-ເນນ' }}
                />
                <Tab.Screen
                    name="Docs"
                    component={DocumentsScreen}
                    options={{ title: 'ຫໍສະໝຸດ' }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{ title: 'ໂປຣຟາຍ' }}
                />
            </Tab.Navigator>
        </SafeAreaView>
    );
};

export default MainTabNavigator;

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MembersListScreen from '../screens/MembersListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import HomeScreen from '../screens/HomeScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
            <Tab.Navigator
                screenOptions={{
                    tabBarStyle: { 
                        backgroundColor: '#FFFFFF',
                        borderTopColor: '#F4D03F',
                        borderTopWidth: 2,
                        height: 70,
                        paddingBottom: 5,
                        elevation: 3,
                    },
                    tabBarLabelStyle: { 
                        fontSize: 12, 
                        fontWeight: 'bold', 
                        color: '#000',
                        opacity: 1,
                        marginVertical: 5,
                        padding: 0,
                    },
                    tabBarActiveTintColor: '#F4D03F',
                    tabBarInactiveTintColor: '#999',
                    headerShown: false,
                    tabBarIconStyle: { width: 24, height: 24, margin: 0 },
                    tabBarShowLabel: true,
                }}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ 
                        title: 'ໜ້າຫຼັກ',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name="home" size={24} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Members"
                    component={MembersListScreen}
                    options={{ 
                        title: 'ພຣະ-ເນນ',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name="people" size={24} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Docs"
                    component={DocumentsScreen}
                    options={{ 
                        title: 'ຫໍສະໝຸດ',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name="document" size={24} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{ 
                        title: 'ໂປຣຟາຍ',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name="person" size={24} color={color} />
                        ),
                    }}
                />
            </Tab.Navigator>
        </SafeAreaView>
    );
};

export default MainTabNavigator;

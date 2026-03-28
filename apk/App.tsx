import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { 
  View
} from 'react-native';
import { 
  Ionicons, 
  MaterialCommunityIcons 
} from '@expo/vector-icons';

// Import Screens
import HomeScreen from './src/screens/HomeScreen';
import RatesScreen from './src/screens/RatesScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import VideosScreen from './src/screens/VideosScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#0f0f1a',
              borderTopWidth: 2,
              borderTopColor: '#d4af37',
              height: 65,
              paddingBottom: 10,
              paddingTop: 5,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
            tabBarActiveTintColor: '#d4af37',
            tabBarInactiveTintColor: 'rgba(148,163,184,0.6)',
            tabBarLabelStyle: {
              fontSize: 9,
              fontWeight: 'bold',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              marginTop: 2,
            },
            // Icon Selection with Focused Dot
            tabBarIcon: ({ color, size, focused }) => {
              let iconName: any;
              let IconComponent: any;
              
              if (route.name === 'Home') {
                IconComponent = Ionicons;
                iconName = 'home';
              } else if (route.name === 'Rates') {
                IconComponent = MaterialCommunityIcons;
                iconName = 'trending-up';
              } else if (route.name === 'Alerts') {
                IconComponent = MaterialCommunityIcons;
                iconName = 'bell';
              } else {
                IconComponent = MaterialCommunityIcons;
                iconName = 'youtube';
              }

              return (
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <IconComponent 
                    name={iconName} 
                    size={focused ? 22 : 20} 
                    color={color} 
                  />
                  {focused && (
                    <View 
                      style={{ 
                        width: 4, 
                        height: 4, 
                        borderRadius: 2, 
                        backgroundColor: '#d4af37', 
                        marginTop: 4,
                        position: 'absolute',
                        bottom: -8
                      }} 
                    />
                  )}
                </View>
              );
            },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerTitle: 'Abhinav Gold & Silver' }}
          />
          <Tab.Screen 
            name="Rates" 
            component={RatesScreen} 
            options={{ headerTitle: 'Live Rates' }}
          />
          <Tab.Screen 
            name="Alerts" 
            component={AlertsScreen} 
            options={{ headerTitle: 'Notifications' }}
          />
          <Tab.Screen 
            name="Videos" 
            component={VideosScreen} 
            options={{ headerTitle: 'Video Gallery' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

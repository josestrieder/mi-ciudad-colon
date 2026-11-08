import Ionicons from '@react-native-vector-icons/ionicons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#208AEF' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <Ionicons name="map" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recorrido"
        options={{
          title: 'Mi recorrido',
          tabBarIcon: ({ color }) => <Ionicons name="footsteps" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="yo"
        options={{
          title: 'Yo',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
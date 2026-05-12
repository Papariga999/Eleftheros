import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...(props as any)} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="tax" />
      <Tabs.Screen name="invoice" />
      <Tabs.Screen name="expenses" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

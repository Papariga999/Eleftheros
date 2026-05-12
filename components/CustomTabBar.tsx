import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { STR } from '../constants/strings';
import {
  ExpenseIcon,
  HomeIcon,
  PersonIcon,
  PlusIcon,
  TaxIcon,
} from './Icons';

const TABS = [
  { name: 'index',    labelKey: 'nav1' as const, Icon: HomeIcon    },
  { name: 'tax',      labelKey: 'nav3' as const, Icon: TaxIcon     },
  { name: 'invoice',  labelKey: 'nav2' as const, Icon: PlusIcon    },
  { name: 'expenses', labelKey: 'nav4' as const, Icon: ExpenseIcon },
  { name: 'profile',  labelKey: 'nav5' as const, Icon: PersonIcon  },
];

interface Props {
  state: { index: number; routes: { name: string }[] };
  navigation: { navigate: (name: string) => void; emit: (opts: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean } };
}

export default function CustomTabBar({ state, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { lang } = useApp();
  const t = STR[lang];

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      <View style={styles.bar}>
        {TABS.map((tab, i) => {
          const isCurrent = state.routes[state.index]?.name === tab.name;
          const isCenter = tab.name === 'invoice';

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: (state.routes[i] as any)?.key ?? tab.name, canPreventDefault: true });
            if (!isCurrent && !event.defaultPrevented) navigation.navigate(tab.name);
          };

          if (isCenter) {
            return (
              <View key={tab.name} style={styles.centerSlot}>
                <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.fab}>
                  <PlusIcon size={24} stroke="#fff" strokeWidth={2.6} />
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity key={tab.name} onPress={onPress} activeOpacity={0.7} style={styles.tabBtn}>
              <View style={[styles.pill, isCurrent && styles.pillActive]}>
                <tab.Icon size={21} stroke={isCurrent ? C.primary : C.inkSoft} strokeWidth={isCurrent ? 2 : 1.7} />
              </View>
              <Text style={[styles.tabLabel, isCurrent && styles.tabLabelActive]}>
                {t[tab.labelKey]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 8,
    paddingHorizontal: 14,
    pointerEvents: 'box-none',
  },
  bar: {
    height: 64,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    shadowColor: 'rgba(20,40,30,1)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  tabBtn: {
    flex: 1,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  pill: {
    width: 42,
    height: 26,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: C.primarySoft,
  },
  tabLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10.5,
    color: C.inkSoft,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    fontFamily: 'Manrope_700Bold',
    color: C.primary,
  },
  centerSlot: {
    flex: '0 0 64px' as unknown as number,
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 99,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 14,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});

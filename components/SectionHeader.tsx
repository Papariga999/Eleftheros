import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { C } from '../constants/theme';

export default function SectionHeader({ children }: { children: string }) {
  return <Text style={styles.text}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
    fontFamily: 'Manrope_700Bold',
    fontSize: 10.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: C.inkSoft,
  },
});

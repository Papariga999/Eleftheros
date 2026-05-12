import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C } from '../constants/theme';

interface Props {
  initials: string;
  color?: string;
  soft?: string;
  size?: number;
}

export default function Avatar({ initials, color = C.primary, soft = C.primarySoft, size = 36 }: Props) {
  return (
    <View style={[styles.base, { width: size, height: size, borderRadius: 12, backgroundColor: soft }]}>
      <Text style={[styles.text, { color, fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    fontFamily: 'Manrope_700Bold',
  },
});

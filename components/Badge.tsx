import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C } from '../constants/theme';

type Kind = 'paid' | 'pending' | 'overdue';

const MAP: Record<Kind, { bg: string; fg: string; dot: string }> = {
  paid:    { bg: C.successSoft, fg: '#0f6a39', dot: C.success },
  pending: { bg: C.warningSoft, fg: '#8a5a14', dot: C.warning },
  overdue: { bg: C.dangerSoft,  fg: '#8d2a24', dot: C.danger  },
};

interface Props {
  kind: Kind;
  children: string;
}

export default function Badge({ kind, children }: Props) {
  const m = MAP[kind];
  return (
    <View style={[styles.base, { backgroundColor: m.bg }]}>
      <View style={[styles.dot, { backgroundColor: m.dot }]} />
      <Text style={[styles.text, { color: m.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 99,
  },
  text: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11.5,
    lineHeight: 14,
  },
});

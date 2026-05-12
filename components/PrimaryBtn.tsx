import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { C } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  small?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export default function PrimaryBtn({ children, onPress, style, small, loading, disabled }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} disabled={loading || disabled} style={[styles.btn, small && styles.small, (loading || disabled) && { opacity: 0.7 }, style]}>
      {loading
        ? <ActivityIndicator color="#fff" />
        : <Text style={[styles.label, small && styles.labelSmall]}>{children}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  small: {
    height: 44,
    borderRadius: 12,
  },
  label: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    color: '#fff',
  },
  labelSmall: {
    fontSize: 13.5,
  },
});

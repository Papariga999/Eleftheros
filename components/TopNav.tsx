import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C } from '../constants/theme';
import { BackIcon, CloseIcon } from './Icons';

interface Props {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
  right?: React.ReactNode;
}

export default function TopNav({ title, onBack, onClose, right }: Props) {
  return (
    <View style={styles.row}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
          <BackIcon size={20} stroke={C.ink} />
        </TouchableOpacity>
      )}
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
          <CloseIcon size={20} stroke={C.ink} />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rightSlot}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Manrope_700Bold',
    fontSize: 17,
    color: C.ink,
    letterSpacing: -0.2,
  },
  rightSlot: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
});

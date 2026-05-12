import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C } from '../constants/theme';
import type { Lang } from '../constants/strings';

interface Props {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export default function LangToggle({ lang, setLang }: Props) {
  const isEL = lang === 'el';
  const anim = useRef(new Animated.Value(isEL ? 0 : 1)).current;

  const toggle = () => {
    const next = isEL ? 'en' : 'el';
    Animated.timing(anim, {
      toValue: next === 'en' ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
    setLang(next);
  };

  const left = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 32] });

  return (
    <TouchableOpacity onPress={toggle} activeOpacity={0.9} style={styles.track}>
      <Animated.View style={[styles.thumb, { left }]} />
      <Text style={[styles.label, isEL && styles.labelActive]}>ΕΛ</Text>
      <Text style={[styles.label, !isEL && styles.labelActive]}>EN</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    width: 64,
    height: 30,
    borderRadius: 999,
    backgroundColor: C.cardSoft,
    borderWidth: 1,
    borderColor: C.border,
    padding: 2,
    flexShrink: 0,
  },
  thumb: {
    position: 'absolute',
    top: 2,
    width: 30,
    height: 24,
    borderRadius: 999,
    backgroundColor: C.primary,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: C.inkSoft,
    letterSpacing: 0.4,
    zIndex: 1,
  },
  labelActive: {
    color: '#fff',
  },
});

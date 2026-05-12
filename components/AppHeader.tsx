import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C } from '../constants/theme';
import type { Lang } from '../constants/strings';
import { BackIcon, SprigIcon } from './Icons';
import LangToggle from './LangToggle';

interface Props {
  lang: Lang;
  setLang: (l: Lang) => void;
  subtitle?: string;
  title: string;
  onBack?: () => void;
}

export default function AppHeader({ lang, setLang, subtitle, title, onBack }: Props) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <BackIcon size={20} stroke={C.ink} />
        </TouchableOpacity>
      ) : (
        <View style={styles.sprigTile}>
          <SprigIcon size={22} />
        </View>
      )}

      <View style={styles.middle}>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>

      <LangToggle lang={lang} setLang={setLang} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 4,
  },
  sprigTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  middle: {
    flex: 1,
    minWidth: 0,
  },
  subtitle: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: C.inkSoft,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Newsreader_500Medium',
    fontSize: 24,
    color: C.ink,
    letterSpacing: -0.3,
    marginTop: 2,
  },
});

import React from 'react';
import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import { C } from '../constants/theme';

interface Props {
  value: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  trailing?: React.ReactNode;
  editable?: boolean;
  style?: ViewStyle;
}

export default function AppTextInput({ value, onChangeText, placeholder, secureTextEntry, keyboardType = 'default', trailing, editable = true, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.inkFaint}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14.5,
    color: C.ink,
    padding: 0,
  },
});

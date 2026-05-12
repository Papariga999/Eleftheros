import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { BoltIcon } from '../../components/Icons';
import PrimaryBtn from '../../components/PrimaryBtn';
import SecondaryBtn from '../../components/SecondaryBtn';

export default function WelcomeScreen() {
  const { lang } = useApp();
  const isEL = lang === 'el';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.appIcon}>
          <BoltIcon size={38} stroke="#fff" fill="none" strokeWidth={2} />
        </View>
        <Text style={styles.wordmark}>ελεύθερος</Text>
        <Text style={styles.tagline}>
          {isEL ? 'Τιμολόγια & φόροι, απλά.' : 'Invoices & taxes, simply.'}
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryBtn onPress={() => router.push('/(auth)/register')}>
          {isEL ? 'Δημιουργία Λογαριασμού' : 'Create Account'}
        </PrimaryBtn>
        <SecondaryBtn onPress={() => router.push('/(auth)/login')}>
          {isEL ? 'Σύνδεση' : 'Sign in'}
        </SecondaryBtn>
      </View>

      <Text style={styles.legal}>
        {isEL ? 'Συνεχίζοντας, αποδέχεστε τους ' : 'By continuing, you accept the '}
        <Text style={styles.legalLink}>{isEL ? 'Όρους Χρήσης' : 'Terms'}</Text>
        {isEL ? ' και την ' : ' and '}
        <Text style={styles.legalLink}>{isEL ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}</Text>
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f0',
    paddingHorizontal: 0,
    paddingBottom: 38,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 99,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  wordmark: {
    fontFamily: 'Newsreader_500Medium',
    fontSize: 36,
    color: C.primary,
    letterSpacing: -0.8,
    marginTop: 16,
  },
  tagline: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14.5,
    color: C.inkSoft,
    textAlign: 'center',
    maxWidth: 280,
    marginTop: 8,
  },
  actions: {
    paddingHorizontal: 28,
    gap: 10,
  },
  legal: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: C.inkFaint,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 32,
    marginTop: 22,
  },
  legalLink: {
    fontFamily: 'Manrope_600SemiBold',
    color: C.primary,
  },
});

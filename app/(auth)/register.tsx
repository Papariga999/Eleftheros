import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { CheckIcon, EyeIcon, ShieldIcon } from '../../components/Icons';
import AppTextInput from '../../components/AppTextInput';
import PrimaryBtn from '../../components/PrimaryBtn';
import TopNav from '../../components/TopNav';
import { auth as authApi, setToken } from '../../services/api';
import { useTaxisNetAuth } from '../../hooks/useTaxisNetAuth';

export default function RegisterScreen() {
  const { lang, login } = useApp();
  const isEL = lang === 'el';

  const [name, setName] = useState('');
  const [afm, setAfm] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const afmOk = /^\d{9}$/.test(afm);

  const taxisNet = useTaxisNetAuth({
    onSuccess: () => { login(); router.replace('/(tabs)'); },
    onError: msg => setError(msg),
  });

  const handleSubmit = async () => {
    if (!name || !email || !pw || pw !== pw2 || !afmOk) return;
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register({ email, password: pw, fullName: name, afm });
      await setToken(res.token);
      login();
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message ?? (isEL ? 'Σφάλμα εγγραφής' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav
        title={isEL ? 'Δημιουργία Λογαριασμού' : 'Create Account'}
        onBack={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.subhead}>
          {isEL
            ? 'Συνδέστε τον TaxisNet λογαριασμό σας για αυτόματη συμπλήρωση'
            : 'Connect your TaxisNet account for autofill'}
        </Text>

        {/* TaxisNet card */}
        <View style={styles.taxisCard}>
          <View style={styles.taxisRow}>
            <View style={styles.shieldIcon}>
              <ShieldIcon size={20} stroke={C.primary} strokeWidth={2} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.taxisTitle}>
                {isEL ? 'Σύνδεση μέσω TaxisNet' : 'Connect via TaxisNet'}
              </Text>
              <Text style={styles.taxisSub}>
                {isEL
                  ? 'Αυτόματη εισαγωγή ΑΦΜ, επωνυμίας & διεύθυνσης'
                  : 'Auto-import VAT ID, name & address'}
              </Text>
            </View>
          </View>
          <PrimaryBtn small style={{ marginTop: 12 }} onPress={() => taxisNet.promptAsync()} disabled={taxisNet.disabled}>
            {isEL ? 'Σύνδεση TaxisNet →' : 'Connect TaxisNet →'}
          </PrimaryBtn>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>
            {isEL ? 'ή συμπληρώστε χειροκίνητα' : 'or fill in manually'}
          </Text>
          <View style={styles.line} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <AppTextInput value={name} onChangeText={setName} placeholder={isEL ? 'Ονοματεπώνυμο' : 'Full name'} />
          <AppTextInput
            value={afm}
            onChangeText={v => setAfm(v.replace(/\D/g, '').slice(0, 9))}
            placeholder={isEL ? 'ΑΦΜ (9 ψηφία)' : 'VAT ID (9 digits)'}
            keyboardType="numeric"
            trailing={afmOk ? (
              <View style={styles.checkCircle}>
                <CheckIcon size={13} stroke="#fff" strokeWidth={2.6} />
              </View>
            ) : undefined}
          />
          <AppTextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
          <AppTextInput
            value={pw} onChangeText={setPw}
            placeholder={isEL ? 'Κωδικός πρόσβασης' : 'Password'}
            secureTextEntry={!showPw}
            trailing={
              <TouchableOpacity onPress={() => setShowPw(p => !p)}>
                <EyeIcon size={18} stroke={C.inkSoft} />
              </TouchableOpacity>
            }
          />
          <AppTextInput
            value={pw2} onChangeText={setPw2}
            placeholder={isEL ? 'Επιβεβαίωση κωδικού' : 'Confirm password'}
            secureTextEntry={!showPw2}
            trailing={
              <TouchableOpacity onPress={() => setShowPw2(p => !p)}>
                <EyeIcon size={18} stroke={C.inkSoft} />
              </TouchableOpacity>
            }
          />
        </View>

        {error ? (
          <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12.5, color: C.danger, textAlign: 'center', marginTop: 8 }}>
            {error}
          </Text>
        ) : null}
        <PrimaryBtn onPress={handleSubmit} loading={loading} style={{ marginTop: 6 }}>
          {isEL ? 'Δημιουργία Λογαριασμού' : 'Create Account'}
        </PrimaryBtn>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{isEL ? 'Έχετε ήδη λογαριασμό; ' : 'Already have an account? '}</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerLink}>{isEL ? 'Σύνδεση →' : 'Sign in →'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  subhead: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: C.inkSoft,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  taxisCard: {
    backgroundColor: C.primarySoft,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: C.primaryGlow,
  },
  taxisRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  shieldIcon: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#dceae0', color: C.primary,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  taxisTitle: { fontFamily: 'Manrope_700Bold', fontSize: 14.5, color: C.ink },
  taxisSub: { fontFamily: 'Manrope_500Medium', fontSize: 12, color: C.inkSoft, marginTop: 3, lineHeight: 17 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontFamily: 'Manrope_600SemiBold', fontSize: 11.5, color: C.inkFaint },
  form: { gap: 10 },
  checkCircle: {
    width: 22, height: 22, borderRadius: 99, backgroundColor: C.success,
    alignItems: 'center', justifyContent: 'center',
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontFamily: 'Manrope_500Medium', fontSize: 13, color: C.inkSoft },
  footerLink: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: C.primary },
});

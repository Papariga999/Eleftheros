import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import { CalendarIcon, ChevronDownIcon, ChevronRightIcon, SearchIcon } from '../../components/Icons';
import { C } from '../../constants/theme';
import { STR } from '../../constants/strings';
import { useApp } from '../../context/AppContext';
import { eurDec } from '../../utils/currency';
import { type VatRate, invoices as invoicesApi } from '../../services/api';

const CLIENTS = (lang: 'el' | 'en') => [
  { id: 1, name: 'Καππά Studio',    sub: lang === 'el' ? 'Αθήνα · 4 τιμολόγια' : 'Athens · 4 invoices', init: 'ΚΣ', color: C.primary },
  { id: 2, name: 'Δημήτρης Παππάς', sub: lang === 'el' ? 'Θεσσαλονίκη'         : 'Thessaloniki',         init: 'ΔΠ', color: C.accent  },
  { id: 3, name: 'Aegean Tech',     sub: lang === 'el' ? 'Πελάτης εξωτερικού · ΕΕ' : 'EU client',        init: 'AT', color: '#5a7d9a' },
  { id: 4, name: 'Olive & Co.',     sub: lang === 'el' ? 'Νέος πελάτης'        : 'New client',           init: 'OC', color: '#7a6a3a' },
];

export default function InvoiceScreen() {
  const { lang, setLang } = useApp();
  const t = STR[lang];

  const [client, setClient] = useState<ReturnType<typeof CLIENTS>[0] | null>(null);
  const [showClients, setShowClients] = useState(false);
  const [desc, setDesc] = useState(lang === 'el' ? 'Σχεδιασμός λογοτύπου' : 'Logo design');
  const [amount, setAmount] = useState('800');
  const [vatPct, setVatPct] = useState(24);
  const [date, setDate] = useState(lang === 'el' ? '8 Μαΐου 2025' : 'May 8, 2025');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setDate(lang === 'el' ? '8 Μαΐου 2025' : 'May 8, 2025');
  }, [lang]);

  const handleSubmit = async () => {
    if (!client || !desc || !amount) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await invoicesApi.create({
        clientName: client.name,
        issueDate: new Date().toISOString().split('T')[0],
        lines: [{ description: desc, unitPrice: parseFloat(amount) || 0, vatRate: vatPct as VatRate }],
      });
      router.back();
    } catch (e: any) {
      setSubmitError(e.message ?? (lang === 'el' ? 'Σφάλμα αποστολής' : 'Submit error'));
    } finally {
      setSubmitting(false);
    }
  };

  const net = parseFloat(amount) || 0;
  const vat = Math.round(net * vatPct / 100 * 100) / 100;
  const total = net + vat;

  const clients = CLIENTS(lang);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <AppHeader
          lang={lang} setLang={setLang}
          subtitle={lang === 'el' ? 'Νέα καταχώρηση' : 'New entry'}
          title={t.newInvoice}
          onBack={() => router.back()}
        />

        <View style={styles.px}>
          {/* Client picker */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{t.selectClient.toUpperCase()}</Text>
            <View style={styles.fieldCard}>
              <TouchableOpacity onPress={() => setShowClients(s => !s)} style={styles.clientToggle}>
                {client ? (
                  <>
                    <Avatar initials={client.init} color={client.color} soft={client.color + '30'} size={34} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.clientName}>{client.name}</Text>
                      <Text style={styles.clientSub}>{client.sub}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.searchIcon}>
                      <SearchIcon size={20} stroke={C.inkSoft} />
                    </View>
                    <Text style={styles.clientPh}>{t.selectClientPh}</Text>
                  </>
                )}
                <View style={{ transform: [{ rotate: showClients ? '180deg' : '0deg' }] }}>
                  <ChevronDownIcon size={18} stroke={C.inkSoft} strokeWidth={2} />
                </View>
              </TouchableOpacity>

              {showClients && (
                <View style={styles.clientList}>
                  <View style={styles.searchRow}>
                    <SearchIcon size={16} stroke={C.inkSoft} />
                    <Text style={styles.searchPh}>{lang === 'el' ? 'Αναζήτηση πελάτη…' : 'Search clients…'}</Text>
                  </View>
                  {clients.map(c => (
                    <TouchableOpacity key={c.id} onPress={() => { setClient(c); setShowClients(false); }} style={styles.clientRow}>
                      <Avatar initials={c.init} color={c.color} soft={c.color + '30'} size={30} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.clientRowName}>{c.name}</Text>
                        <Text style={styles.clientRowSub}>{c.sub}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{t.description.toUpperCase()}</Text>
            <View style={styles.fieldCard}>
              <TextInput
                value={desc} onChangeText={setDesc}
                placeholder={t.descriptionPh}
                placeholderTextColor={C.inkFaint}
                style={styles.descInput}
              />
            </View>
          </View>

          {/* Amount + VAT */}
          <View style={styles.amountVatRow}>
            <View style={[styles.fieldWrap, { flex: 1.35 }]}>
              <Text style={styles.fieldLabel}>{t.amount.toUpperCase()}</Text>
              <View style={[styles.fieldCard, styles.amountCard]}>
                <Text style={styles.euroSign}>€</Text>
                <TextInput
                  value={amount} onChangeText={setAmount}
                  keyboardType="numeric"
                  style={styles.amountInput}
                  placeholderTextColor={C.inkFaint}
                />
              </View>
            </View>
            <View style={[styles.fieldWrap, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>{t.vat.toUpperCase()}</Text>
              <View style={[styles.fieldCard, styles.vatCard]}>
                {[0, 13, 24].map(v => (
                  <TouchableOpacity key={v} onPress={() => setVatPct(v)} style={[styles.vatOpt, vatPct === v && styles.vatOptActive]}>
                    <Text style={[styles.vatLabel, vatPct === v && styles.vatLabelActive]}>{v}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Date */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{t.date.toUpperCase()}</Text>
            <View style={styles.fieldCard}>
              <View style={styles.dateRow}>
                <CalendarIcon size={20} stroke={C.primary} />
                <Text style={styles.dateText}>{date}</Text>
                <ChevronRightIcon size={18} stroke={C.inkFaint} strokeWidth={2} />
              </View>
            </View>
          </View>

          {/* Live preview */}
          <View style={styles.preview}>
            <View style={styles.previewHeader}>
              <View style={styles.previewDot} />
              <Text style={styles.previewEyebrow}>{t.livePreview.toUpperCase()}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>{t.net}</Text>
              <Text style={styles.previewValue}>{eurDec(net, lang)}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>{t.vat} {vatPct}%</Text>
              <Text style={styles.previewValue}>{eurDec(vat, lang)}</Text>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewRow}>
              <Text style={styles.previewTotalLabel}>{t.total}</Text>
              <Text style={styles.previewTotal}>{eurDec(total, lang)}</Text>
            </View>
          </View>

          {/* CTA */}
          {submitError ? (
            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12, color: C.danger, textAlign: 'center' }}>
              {submitError}
            </Text>
          ) : null}
          <TouchableOpacity style={[styles.cta, (!client || submitting) && { opacity: 0.6 }]} onPress={handleSubmit} disabled={!client || submitting}>
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.ctaLabel}>{t.sendMydata} →</Text>}
          </TouchableOpacity>
          <Text style={styles.hint}>{t.markHint}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 120 },
  px: { paddingHorizontal: 22, gap: 12, flexDirection: 'column' },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontFamily: 'Manrope_700Bold', fontSize: 10.5, color: C.inkSoft, letterSpacing: 0.5, marginLeft: 4 },
  fieldCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  clientToggle: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12 },
  searchIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: C.cardSoft, alignItems: 'center', justifyContent: 'center' },
  clientPh: { flex: 1, fontFamily: 'Manrope_500Medium', fontSize: 14, color: C.inkFaint },
  clientName: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: C.ink },
  clientSub: { fontFamily: 'Manrope_500Medium', fontSize: 11.5, color: C.inkFaint },
  clientList: { borderTopWidth: 1, borderTopColor: C.borderSoft, padding: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, paddingHorizontal: 10, backgroundColor: C.cardSoft, borderRadius: 10, marginBottom: 6 },
  searchPh: { fontFamily: 'Manrope_500Medium', fontSize: 12.5, color: C.inkFaint },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 10 },
  clientRowName: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: C.ink },
  clientRowSub: { fontFamily: 'Manrope_400Regular', fontSize: 11, color: C.inkFaint },
  descInput: { fontFamily: 'Manrope_500Medium', fontSize: 14, color: C.ink, padding: 12 },
  amountVatRow: { flexDirection: 'row', gap: 10 },
  amountCard: { flexDirection: 'row', alignItems: 'baseline', paddingHorizontal: 12, paddingVertical: 12, gap: 4 },
  euroSign: { fontFamily: 'Manrope_600SemiBold', fontSize: 18, color: C.inkFaint },
  amountInput: { flex: 1, fontFamily: 'Manrope_700Bold', fontSize: 22, color: C.ink, padding: 0 },
  vatCard: { flexDirection: 'row', padding: 3, gap: 2 },
  vatOpt: { flex: 1, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  vatOptActive: { backgroundColor: C.primary },
  vatLabel: { fontFamily: 'Manrope_700Bold', fontSize: 12, color: C.inkSoft },
  vatLabelActive: { color: '#fff' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  dateText: { flex: 1, fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: C.ink },
  preview: {
    marginTop: 4, borderRadius: 18,
    backgroundColor: '#f8f3e6', borderWidth: 1, borderColor: C.border, padding: 14,
  },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  previewDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: C.accent },
  previewEyebrow: { fontFamily: 'Manrope_700Bold', fontSize: 10.5, color: C.inkSoft, letterSpacing: 0.4 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingVertical: 3 },
  previewLabel: { fontFamily: 'Manrope_500Medium', fontSize: 13, color: C.inkSoft },
  previewValue: { fontFamily: 'Manrope_600SemiBold', fontSize: 13.5, color: C.ink },
  previewDivider: { height: 1, backgroundColor: '#e3d8b8', marginVertical: 8 },
  previewTotalLabel: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: C.ink },
  previewTotal: { fontFamily: 'Manrope_800ExtraBold', fontSize: 19, color: C.ink, letterSpacing: -0.3 },
  cta: {
    marginTop: 6, height: 54, borderRadius: 16, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 6,
  },
  ctaLabel: { fontFamily: 'Manrope_700Bold', fontSize: 15, color: '#fff' },
  hint: { fontFamily: 'Manrope_500Medium', fontSize: 11.5, color: C.inkFaint, textAlign: 'center', lineHeight: 17, marginTop: 4 },
});

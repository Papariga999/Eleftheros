import { router } from 'expo-router';
import React, { useState } from 'react';
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
import { type VatRate, type Invoice, invoices as invoicesApi } from '../../services/api';

const CLIENTS = (lang: 'el' | 'en') => [
  { id: 1, name: 'Καππά Studio',    sub: lang === 'el' ? 'Αθήνα · 4 τιμολόγια' : 'Athens · 4 invoices', init: 'ΚΣ', color: C.primary },
  { id: 2, name: 'Δημήτρης Παππάς', sub: lang === 'el' ? 'Θεσσαλονίκη'         : 'Thessaloniki',         init: 'ΔΠ', color: C.accent  },
  { id: 3, name: 'Aegean Tech',     sub: lang === 'el' ? 'Πελάτης εξωτερικού · ΕΕ' : 'EU client',        init: 'AT', color: '#5a7d9a' },
  { id: 4, name: 'Olive & Co.',     sub: lang === 'el' ? 'Νέος πελάτης'        : 'New client',           init: 'OC', color: '#7a6a3a' },
];

const INVOICE_TYPES = [
  { code: '2.1', labelEl: 'Παροχή Υπηρεσιών', labelEn: 'Service Invoice' },
  { code: '1.1', labelEl: 'Τιμολόγιο Πώλησης', labelEn: 'Sales Invoice' },
];

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function fmtDate(iso: string, lang: 'el' | 'en') {
  return new Date(iso).toLocaleDateString(lang === 'el' ? 'el-GR' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function InvoiceScreen() {
  const { lang, setLang } = useApp();
  const t = STR[lang];

  const [client, setClient]         = useState<ReturnType<typeof CLIENTS>[0] | null>(null);
  const [showClients, setShowClients] = useState(false);
  const [clientAfm, setClientAfm]   = useState('');
  const [invoiceType, setInvoiceType] = useState('2.1');
  const [desc, setDesc]             = useState(lang === 'el' ? 'Σχεδιασμός λογοτύπου' : 'Logo design');
  const [amount, setAmount]         = useState('800');
  const [vatPct, setVatPct]         = useState(24);
  const [issueDate]                 = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult]         = useState<Invoice | null>(null);

  const net   = parseFloat(amount) || 0;
  const vat   = Math.round(net * vatPct / 100 * 100) / 100;
  const total = net + vat;

  const handleSubmit = async () => {
    if (!client || !desc || !amount) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const inv = await invoicesApi.create({
        clientName: client.name,
        clientAfm: clientAfm.trim() || undefined,
        issueDate,
        invoiceType,
        lines: [{ description: desc, unitPrice: parseFloat(amount) || 0, vatRate: vatPct as VatRate }],
      });
      setResult(inv);
    } catch (e: any) {
      setSubmitError(e.message ?? (lang === 'el' ? 'Σφάλμα αποστολής' : 'Submit error'));
    } finally {
      setSubmitting(false);
    }
  };

  const clients = CLIENTS(lang);

  // ── Success view ─────────────────────────────────────────────────────────────
  if (result) {
    const isSubmitted = result.status === 'submitted';
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppHeader lang={lang} setLang={setLang}
          subtitle={lang === 'el' ? 'Αποστολή' : 'Submission'}
          title={isSubmitted
            ? (lang === 'el' ? 'Επιτυχής καταχώρηση' : 'Successfully submitted')
            : (lang === 'el' ? 'Αποθηκεύτηκε ως πρόχειρο' : 'Saved as draft')}
          onBack={() => router.back()}
        />
        <ScrollView contentContainerStyle={styles.successScroll}>
          <View style={styles.successCard}>
            <View style={[styles.statusBadge, { backgroundColor: isSubmitted ? '#e6f4ec' : '#fef3e2' }]}>
              <Text style={[styles.statusBadgeText, { color: isSubmitted ? '#1a7a3c' : '#b45309' }]}>
                {isSubmitted
                  ? (lang === 'el' ? 'ΑΠΟΣΤΟΛΗ myDATA' : 'SENT TO myDATA')
                  : (lang === 'el' ? 'ΠΡΟΧΕΙΡΟ' : 'DRAFT')}
              </Text>
            </View>

            <Text style={styles.successClient}>{result.clientName}</Text>
            <Text style={styles.successAmount}>{eurDec(result.totalGrossValue, lang)}</Text>
            <Text style={styles.successSub}>
              {fmtDate(result.issueDate, lang)} · {lang === 'el' ? 'Σειρά' : 'Series'} {result.series}/{result.aa}
            </Text>

            {result.mark ? (
              <View style={styles.markBlock}>
                <Text style={styles.markLabel}>MARK</Text>
                <Text style={styles.markValue}>{result.mark}</Text>
                {result.uid ? (
                  <>
                    <Text style={[styles.markLabel, { marginTop: 10 }]}>UID</Text>
                    <Text style={[styles.markValue, { fontSize: 11 }]}>{result.uid}</Text>
                  </>
                ) : null}
              </View>
            ) : null}

            {!isSubmitted ? (
              <Text style={styles.draftNote}>
                {lang === 'el'
                  ? 'Η αποστολή στο myDATA απέτυχε. Μπορείτε να δοκιμάσετε ξανά από τη λίστα τιμολογίων.'
                  : 'myDATA submission failed. You can retry from the invoices list.'}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity style={styles.cta} onPress={() => { setResult(null); setClient(null); setDesc(lang === 'el' ? 'Σχεδιασμός λογοτύπου' : 'Logo design'); setAmount('800'); setClientAfm(''); }}>
            <Text style={styles.ctaLabel}>{lang === 'el' ? 'Νέο τιμολόγιο' : 'New invoice'} +</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaSecondary} onPress={() => router.back()}>
            <Text style={styles.ctaSecondaryLabel}>{lang === 'el' ? 'Πίσω στη λίστα' : 'Back to list'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Form view ─────────────────────────────────────────────────────────────────
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
          {/* Invoice type */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{(lang === 'el' ? 'ΤΥΠΟΣ' : 'TYPE').toUpperCase()}</Text>
            <View style={[styles.fieldCard, { flexDirection: 'row', padding: 3, gap: 3 }]}>
              {INVOICE_TYPES.map(it => (
                <TouchableOpacity key={it.code} onPress={() => setInvoiceType(it.code)}
                  style={[styles.typeOpt, invoiceType === it.code && styles.typeOptActive]}>
                  <Text style={[styles.typeCode, invoiceType === it.code && styles.typeCodeActive]}>{it.code}</Text>
                  <Text style={[styles.typeLabel, invoiceType === it.code && styles.typeLabelActive]}>
                    {lang === 'el' ? it.labelEl : it.labelEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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

          {/* Client AFM (optional) */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{lang === 'el' ? 'ΑΦΜ ΠΕΛΑΤΗ (ΠΡΟΑΙΡΕΤΙΚΟ)' : 'CLIENT VAT ID (OPTIONAL)'}</Text>
            <View style={styles.fieldCard}>
              <TextInput
                value={clientAfm} onChangeText={setClientAfm}
                placeholder={lang === 'el' ? '9-ψήφιος ΑΦΜ…' : '9-digit VAT ID…'}
                placeholderTextColor={C.inkFaint}
                keyboardType="numeric"
                maxLength={9}
                style={styles.descInput}
              />
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

          {/* Date (read-only, always today) */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{t.date.toUpperCase()}</Text>
            <View style={styles.fieldCard}>
              <View style={styles.dateRow}>
                <CalendarIcon size={20} stroke={C.primary} />
                <Text style={styles.dateText}>{fmtDate(issueDate, lang)}</Text>
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
            <Text style={styles.errorText}>{submitError}</Text>
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
  successScroll: { padding: 22, gap: 12 },
  px: { paddingHorizontal: 22, gap: 12, flexDirection: 'column' },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontFamily: 'Manrope_700Bold', fontSize: 10.5, color: C.inkSoft, letterSpacing: 0.5, marginLeft: 4 },
  fieldCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  // Invoice type toggle
  typeOpt: { flex: 1, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 10, alignItems: 'center' },
  typeOptActive: { backgroundColor: C.primary },
  typeCode: { fontFamily: 'Manrope_700Bold', fontSize: 12, color: C.inkSoft },
  typeCodeActive: { color: '#fff' },
  typeLabel: { fontFamily: 'Manrope_500Medium', fontSize: 10, color: C.inkFaint, marginTop: 1 },
  typeLabelActive: { color: 'rgba(255,255,255,0.85)' },
  // Client picker
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
  // Inputs
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
  // Preview
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
  // CTA
  errorText: { fontFamily: 'Manrope_500Medium', fontSize: 12, color: C.danger, textAlign: 'center' },
  cta: {
    marginTop: 6, height: 54, borderRadius: 16, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 6,
  },
  ctaLabel: { fontFamily: 'Manrope_700Bold', fontSize: 15, color: '#fff' },
  ctaSecondary: {
    height: 44, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaSecondaryLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: C.inkSoft },
  hint: { fontFamily: 'Manrope_500Medium', fontSize: 11.5, color: C.inkFaint, textAlign: 'center', lineHeight: 17, marginTop: 4 },
  // Success view
  successCard: {
    backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border,
    padding: 22, alignItems: 'center', gap: 6,
  },
  statusBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 8 },
  statusBadgeText: { fontFamily: 'Manrope_700Bold', fontSize: 10, letterSpacing: 0.6 },
  successClient: { fontFamily: 'Manrope_700Bold', fontSize: 18, color: C.ink, marginTop: 4 },
  successAmount: { fontFamily: 'Manrope_800ExtraBold', fontSize: 32, color: C.ink, letterSpacing: -0.5, marginTop: 2 },
  successSub: { fontFamily: 'Manrope_500Medium', fontSize: 13, color: C.inkSoft, marginBottom: 8 },
  markBlock: {
    width: '100%', backgroundColor: C.cardSoft, borderRadius: 14,
    padding: 14, alignItems: 'center', marginTop: 8,
  },
  markLabel: { fontFamily: 'Manrope_700Bold', fontSize: 10, color: C.inkSoft, letterSpacing: 0.8 },
  markValue: { fontFamily: 'Manrope_700Bold', fontSize: 20, color: C.ink, letterSpacing: 1.5, marginTop: 2 },
  draftNote: { fontFamily: 'Manrope_500Medium', fontSize: 12.5, color: C.danger, textAlign: 'center', lineHeight: 18, marginTop: 8 },
});

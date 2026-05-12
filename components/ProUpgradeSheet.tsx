import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C } from '../constants/theme';
import { BoltIcon, CheckIcon, CloseIcon } from './Icons';
import PrimaryBtn from './PrimaryBtn';

interface Props {
  lang: 'el' | 'en';
  onClose: () => void;
}

export default function ProUpgradeSheet({ lang, onClose }: Props) {
  const [period, setPeriod] = useState<'monthly' | 'annual'>('annual');
  const isEL = lang === 'el';

  const features = isEL ? [
    'Απεριόριστα τιμολόγια',
    'Πλήρης φορολογική ανάλυση & προβλέψεις',
    'OCR καταχώρηση εξόδων',
    'ΕΦΚΑ & ΦΠΑ υπολογιστής',
    'Εξαγωγή για λογιστή (PDF / CSV)',
    'Ειδοποιήσεις φορολογικών προθεσμιών',
  ] : [
    'Unlimited invoices',
    'Full tax analysis & forecasts',
    'OCR expense capture',
    'EFKA & VAT calculator',
    'Accountant export (PDF / CSV)',
    'Tax deadline reminders',
  ];

  const price = period === 'monthly' ? '€9,99' : '€8,25';
  const per = isEL ? '/μήνα' : '/mo';

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <CloseIcon size={16} stroke={C.inkSoft} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.iconCircle}>
            <BoltIcon size={26} stroke={C.primary} fill={C.primary} />
          </View>
          <Text style={styles.heading}>{isEL ? 'Αναβάθμιση σε Pro' : 'Upgrade to Pro'}</Text>
          <Text style={styles.subheading}>
            {isEL
              ? 'Ξεκλείδωσε πλήρη φορολογική εικόνα & ανάλυση εσόδων'
              : 'Unlock the full tax picture & revenue analytics'}
          </Text>

          {/* Period toggle */}
          <View style={styles.toggleWrap}>
            <View style={styles.toggleTrack}>
              {([
                { k: 'monthly' as const, label: isEL ? 'Μηνιαία' : 'Monthly' },
                { k: 'annual'  as const, label: isEL ? 'Ετήσια'  : 'Annual'  },
              ]).map(opt => {
                const active = period === opt.k;
                return (
                  <TouchableOpacity key={opt.k} onPress={() => setPeriod(opt.k)} style={[styles.toggleOpt, active && styles.toggleOptActive]}>
                    <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>{opt.label}</Text>
                    {opt.k === 'annual' && (
                      <View style={[styles.saveBadge, active && styles.saveBadgeActive]}>
                        <Text style={[styles.saveBadgeText, active && styles.saveBadgeTextActive]}>−17%</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{price}</Text>
            <Text style={styles.pricePer}>{per}</Text>
          </View>
          <Text style={styles.priceSub}>
            {period === 'annual'
              ? (isEL ? 'ή €99 ετήσια — εξοικονόμηση €21' : 'or €99/year — save €21')
              : (isEL ? 'χρέωση μηνιαία' : 'billed monthly')}
          </Text>

          {/* Features */}
          <View style={styles.features}>
            {features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.checkCircle}>
                  <CheckIcon size={13} stroke={C.success} strokeWidth={2.6} />
                </View>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.planNote}>
            <Text style={{ fontFamily: 'Manrope_600SemiBold' }}>Starter</Text>
            {isEL ? ' — 5 τιμολόγια/μήνα  ·  ' : ' — 5 invoices/mo  ·  '}
            <Text style={{ color: C.inkFaint }}>{isEL ? 'Τρέχον πλάνο' : 'Current plan'}</Text>
          </Text>

          <PrimaryBtn onPress={onClose} style={{ marginTop: 14 }}>
            {isEL ? 'Δοκίμασε Pro — 7 μέρες δωρεάν' : 'Try Pro — 7 days free'}
          </PrimaryBtn>
          <Text style={styles.finePrint}>
            {isEL ? 'Ακύρωση οποιαδήποτε στιγμή · Χωρίς χρέωση σήμερα' : 'Cancel anytime · No charge today'}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,25,20,0.42)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 20,
    paddingBottom: 32,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 99,
    backgroundColor: '#dcd6c6',
    marginTop: 10,
    marginBottom: 4,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 99,
    backgroundColor: C.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 99,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 22,
    color: C.ink,
    letterSpacing: -0.4,
    marginTop: 12,
  },
  subheading: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13.5,
    color: C.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginTop: 6,
  },
  toggleWrap: {
    marginTop: 16,
  },
  toggleTrack: {
    flexDirection: 'row',
    backgroundColor: C.cardSoft,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: C.border,
    padding: 3,
  },
  toggleOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
  },
  toggleOptActive: {
    backgroundColor: C.primary,
  },
  toggleLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12.5,
    color: C.inkSoft,
  },
  toggleLabelActive: {
    color: '#fff',
  },
  saveBadge: {
    backgroundColor: C.successSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
  },
  saveBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  saveBadgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: C.success,
  },
  saveBadgeTextActive: {
    color: '#fff',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  price: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 40,
    color: C.ink,
    letterSpacing: -1.4,
  },
  pricePer: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: C.inkSoft,
    marginBottom: 6,
  },
  priceSub: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11.5,
    color: C.inkSoft,
    marginTop: 2,
  },
  features: {
    width: '100%',
    gap: 10,
    marginTop: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 99,
    backgroundColor: C.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: C.ink,
    lineHeight: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: C.border,
    marginTop: 18,
  },
  planNote: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: C.inkSoft,
    marginTop: 12,
    textAlign: 'center',
  },
  finePrint: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: C.inkFaint,
    marginTop: 8,
    textAlign: 'center',
  },
});

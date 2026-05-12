import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C } from '../constants/theme';
import { EyeIcon } from './Icons';
import Avatar from './Avatar';
import AppTextInput from './AppTextInput';
import PrimaryBtn from './PrimaryBtn';
import SectionHeader from './SectionHeader';
import TopNav from './TopNav';

interface Props {
  lang: 'el' | 'en';
  onClose: () => void;
}

export default function EditProfileScreen({ lang, onClose }: Props) {
  const isEL = lang === 'el';
  const [name, setName] = useState(isEL ? 'Γιώργης Παπαδόπουλος' : 'George Papadopoulos');
  const [email, setEmail] = useState('georgios@email.com');
  const [phone, setPhone] = useState('+30 697 000 0000');
  const [doy, setDoy] = useState(isEL ? "Α' Αθηνών" : 'A Athens');
  const [biz, setBiz] = useState('Freelance Designer');
  const [addr, setAddr] = useState(isEL ? 'Αθήνα, Αττική' : 'Athens, Attica');

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <TopNav
          title={isEL ? 'Επεξεργασία Προφίλ' : 'Edit Profile'}
          onClose={onClose}
          right={
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.saveLink}>{isEL ? 'Αποθήκευση' : 'Save'}</Text>
            </TouchableOpacity>
          }
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <Avatar initials="ΓΠ" size={80} />
            <TouchableOpacity>
              <Text style={styles.changePhoto}>{isEL ? 'Αλλαγή φωτογραφίας' : 'Change photo'}</Text>
            </TouchableOpacity>
          </View>

          <SectionHeader>{isEL ? 'ΠΡΟΣΩΠΙΚΑ ΣΤΟΙΧΕΙΑ' : 'PERSONAL'}</SectionHeader>
          <View style={styles.fields}>
            <AppTextInput value={name} onChangeText={setName} />
            <AppTextInput value={email} onChangeText={setEmail} keyboardType="email-address" />
            <AppTextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>

          <SectionHeader>{isEL ? 'ΣΤΟΙΧΕΙΑ ΕΠΙΧΕΙΡΗΣΗΣ' : 'BUSINESS'}</SectionHeader>
          <View style={styles.fields}>
            <AppTextInput
              value="123456789"
              editable={false}
              trailing={
                <View style={styles.verifiedBadge}>
                  <View style={styles.verifiedDot} />
                  <Text style={styles.verifiedText}>{isEL ? 'Επαληθευμένο' : 'Verified'}</Text>
                </View>
              }
            />
            <AppTextInput value={doy} onChangeText={setDoy} />
            <AppTextInput value={biz} onChangeText={setBiz} />
            <AppTextInput value={addr} onChangeText={setAddr} />
          </View>

          <SectionHeader>{isEL ? 'ΛΟΓΑΡΙΑΣΜΟΣ' : 'ACCOUNT'}</SectionHeader>
          <View style={[styles.fields, { paddingBottom: 18 }]}>
            <View style={styles.passwordRow}>
              <Text style={styles.passwordDots}>••••••••</Text>
              <TouchableOpacity>
                <Text style={styles.changeLink}>{isEL ? 'Αλλαγή →' : 'Change →'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.ctaSection}>
            <PrimaryBtn onPress={onClose}>
              {isEL ? 'Αποθήκευση Αλλαγών' : 'Save Changes'}
            </PrimaryBtn>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  avatarSection: {
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 10,
  },
  changePhoto: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: C.primary,
  },
  fields: {
    paddingHorizontal: 22,
    gap: 10,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  verifiedDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: C.success,
  },
  verifiedText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: '#0f6a39',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  passwordDots: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    letterSpacing: 2,
    color: C.ink,
  },
  changeLink: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: C.primary,
  },
  saveLink: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: C.primary,
  },
  ctaSection: {
    paddingHorizontal: 22,
    paddingBottom: 32,
    paddingTop: 6,
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch, Alert, ScrollView, Modal } from 'react-native';
import { ArrowLeft, Check, RefreshCw, Bell, Heart, Info, Code, Star, X } from 'lucide-react-native';
import colors from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { clearOnboarding, getNotificationSettings, saveNotificationSettings } from '../../services/StorageService';

const SettingsScreen = ({ navigation }) => {
  const { language, changeLanguage, t } = useLanguage();
  const [settings, setSettings] = useState({ timerNotifications: true, motivationalReminders: true });
  const [isReleaseNotesVisible, setReleaseNotesVisible] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const s = await getNotificationSettings();
      setSettings(s);
    };
    loadSettings();
  }, []);

  const toggleTimerNotifications = async (value) => {
    const newSettings = { ...settings, timerNotifications: value };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
  };

  const toggleMotivationalReminders = async (value) => {
    const newSettings = { ...settings, motivationalReminders: value };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
  };

  const handleResetOnboarding = async () => {
    await clearOnboarding();
    // Restart the app navigation state back to the root, which will re-evaluate App.tsx logic
    navigation.reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings')}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('language')}</Text>
        
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => changeLanguage('tr')}
          >
            <Text style={[styles.rowText, language === 'tr' && styles.activeText]}>{t('turkish')}</Text>
            {language === 'tr' && <Check size={20} color={colors.primary} />}
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => changeLanguage('en')}
          >
            <Text style={[styles.rowText, language === 'en' && styles.activeText]}>{t('english')}</Text>
            {language === 'en' && <Check size={20} color={colors.primary} />}
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={styles.sectionTitle}>{t('notifications')}</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Bell size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                <Text style={styles.rowText}>{t('timerNotifications')}</Text>
              </View>
              <Switch
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.primary }}
                thumbColor={colors.textPrimary}
                onValueChange={toggleTimerNotifications}
                value={settings.timerNotifications}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Heart size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                <Text style={styles.rowText}>{t('motivationalReminders')}</Text>
              </View>
              <Switch
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.primary }}
                thumbColor={colors.textPrimary}
                onValueChange={toggleMotivationalReminders}
                value={settings.motivationalReminders}
              />
            </View>
          </View>
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={styles.sectionTitle}>Uygulama</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.row} 
              onPress={handleResetOnboarding}
            >
              <Text style={styles.rowText}>{t('resetOnboarding')}</Text>
              <RefreshCw size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={styles.sectionTitle}>{t('about')}</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Code size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                <Text style={styles.rowText}>{t('developer')}</Text>
              </View>
              <Text style={styles.infoText}>Mustafa Karacuha</Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity 
              style={styles.row}
              onPress={() => setReleaseNotesVisible(true)}
            >
              <View style={styles.rowLeft}>
                <Star size={20} color={colors.primary} style={{ marginRight: 12 }} />
                <Text style={styles.rowText}>{t('releaseNotes')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={isReleaseNotesVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setReleaseNotesVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('releaseNotes')}</Text>
              <TouchableOpacity onPress={() => setReleaseNotesVisible(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.releaseNotesDesc}>{t('releaseNotesDesc')}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backBtn: {
    padding: 5,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  activeText: {
    color: colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: 20,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    width: '85%',
    maxHeight: '70%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  releaseNotesDesc: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },
});

export default SettingsScreen;

import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, FontSize } from '../src/constants/theme';

export default function PrivacyPolicyScreen() {
  const { t, i18n } = useTranslation();
  const isTR = i18n.language === 'tr';

  return (
    <>
      <Stack.Screen options={{ title: t('privacy.title') }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {isTR ? <PrivacyContentTR /> : <PrivacyContentEN />}
        <View style={styles.spacer} />
      </ScrollView>
    </>
  );
}

function PrivacyContentTR() {
  return (
    <>
      <Text style={styles.title}>Gizlilik Politikası ve KVKK Aydınlatma Metni</Text>
      <Text style={styles.date}>Son güncelleme: 18 Şubat 2026</Text>

      <Section title="1. Veri Sorumlusu">
        Kampanya Sepeti uygulaması ("Uygulama") olarak kişisel verilerinizin korunmasına büyük
        önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında
        veri sorumlusu sıfatıyla sizleri bilgilendirmek isteriz.
      </Section>

      <Section title="2. Toplanan Kişisel Veriler">
        Uygulamamız aşağıdaki kişisel verileri toplamaktadır:{'\n\n'}
        • E-posta adresi (hesap oluşturma ve giriş için){'\n'}
        • Görüntülenen ad (profil bilgisi, isteğe bağlı){'\n'}
        • Cihaz bilgileri (platform, push bildirim token'ı){'\n'}
        • Takip edilen marka ve kategori tercihleri{'\n'}
        • Abonelik durumu ve ödeme bilgileri (Apple/Google üzerinden)
      </Section>

      <Section title="3. Verilerin İşlenme Amaçları">
        Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:{'\n\n'}
        • Hesap oluşturulması ve kimlik doğrulama{'\n'}
        • Kampanya bildirimlerinin gönderilmesi{'\n'}
        • Kişiselleştirilmiş kampanya önerileri sunulması{'\n'}
        • Abonelik yönetimi{'\n'}
        • Uygulama performansının iyileştirilmesi{'\n'}
        • Yasal yükümlülüklerin yerine getirilmesi
      </Section>

      <Section title="4. Verilerin Saklanma Süresi">
        Kişisel verileriniz, hesabınız aktif olduğu sürece saklanır. Hesabınızı silmeniz
        halinde verileriniz 30 gün içinde kalıcı olarak silinir. Yasal zorunluluklar
        kapsamında belirli veriler ilgili mevzuatta öngörülen süreler boyunca saklanabilir.
      </Section>

      <Section title="5. Verilerin Paylaşılması">
        Kişisel verileriniz aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:{'\n\n'}
        • Hata takibi hizmetleri (Sentry — anonim hata raporları){'\n'}
        • Push bildirim servisleri (Firebase Cloud Messaging){'\n'}
        • Ödeme işlemleri (Apple App Store / Google Play Store){'\n'}
        • Yasal zorunluluk halinde yetkili makamlar
      </Section>

      <Section title="6. Veri Güvenliği">
        Verileriniz SSL/TLS şifreleme ile korunmaktadır. Şifreler hash algoritması ile
        saklanır ve hiçbir zaman düz metin olarak tutulmaz. Veritabanı erişimi
        yetkilendirme ile sınırlandırılmıştır.
      </Section>

      <Section title="7. KVKK Kapsamındaki Haklarınız">
        KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:{'\n\n'}
        • Kişisel verilerinizin işlenip işlenmediğini öğrenme{'\n'}
        • İşlenmiş ise buna ilişkin bilgi talep etme{'\n'}
        • İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme{'\n'}
        • Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme{'\n'}
        • Eksik veya yanlış işlenmiş ise düzeltilmesini isteme{'\n'}
        • KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini isteme{'\n'}
        • İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi
        suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme
      </Section>

      <Section title="8. İletişim">
        KVKK kapsamındaki haklarınızı kullanmak veya sorularınız için
        aşağıdaki adres üzerinden bizimle iletişime geçebilirsiniz:{'\n\n'}
        E-posta: zafer.cankaya@gmail.com
      </Section>
    </>
  );
}

function PrivacyContentEN() {
  return (
    <>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.date}>Last updated: February 18, 2026</Text>

      <Section title="1. Data Controller">
        Kampanya Sepeti ("App") values the protection of your personal data. This privacy policy
        explains how we collect, use, and protect your information.
      </Section>

      <Section title="2. Personal Data Collected">
        Our app collects the following personal data:{'\n\n'}
        • Email address (for account creation and sign-in){'\n'}
        • Display name (profile information, optional){'\n'}
        • Device information (platform, push notification token){'\n'}
        • Followed brand and category preferences{'\n'}
        • Subscription status and payment information (via Apple/Google)
      </Section>

      <Section title="3. Purposes of Data Processing">
        Your personal data is processed for the following purposes:{'\n\n'}
        • Account creation and authentication{'\n'}
        • Sending deal notifications{'\n'}
        • Providing personalized deal recommendations{'\n'}
        • Subscription management{'\n'}
        • Improving app performance{'\n'}
        • Fulfilling legal obligations
      </Section>

      <Section title="4. Data Retention">
        Your personal data is retained as long as your account is active. If you delete
        your account, your data will be permanently deleted within 30 days. Certain data
        may be retained for periods required by applicable laws.
      </Section>

      <Section title="5. Data Sharing">
        Your personal data is not shared with third parties except in the following cases:{'\n\n'}
        • Error tracking services (Sentry — anonymous error reports){'\n'}
        • Push notification services (Firebase Cloud Messaging){'\n'}
        • Payment processing (Apple App Store / Google Play Store){'\n'}
        • Legal authorities when required by law
      </Section>

      <Section title="6. Data Security">
        Your data is protected with SSL/TLS encryption. Passwords are stored using
        hashing algorithms and are never kept in plain text. Database access is
        restricted through authorization controls.
      </Section>

      <Section title="7. Your Rights">
        You have the following rights regarding your personal data:{'\n\n'}
        • Request information about whether your data is being processed{'\n'}
        • Request details about how your data is processed{'\n'}
        • Know which third parties your data has been shared with{'\n'}
        • Request correction of incomplete or inaccurate data{'\n'}
        • Request deletion of your data{'\n'}
        • Object to automated processing that produces adverse results
      </Section>

      <Section title="8. Contact">
        For questions about your privacy or to exercise your rights,
        please contact us at:{'\n\n'}
        Email: zafer.cankaya@gmail.com
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xs },
  date: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  sectionText: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22 },
  spacer: { height: Spacing.xl },
});

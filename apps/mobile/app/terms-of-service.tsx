import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, FontSize } from '../src/constants/theme';

export default function TermsOfServiceScreen() {
  const { t, i18n } = useTranslation();
  const isTR = i18n.language === 'tr';

  return (
    <>
      <Stack.Screen options={{ title: t('terms.title') }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {isTR ? <TermsContentTR /> : <TermsContentEN />}
        <View style={styles.spacer} />
      </ScrollView>
    </>
  );
}

function TermsContentTR() {
  return (
    <>
      <Text style={styles.title}>Kullanım Koşulları</Text>
      <Text style={styles.date}>Son güncelleme: 2 Mart 2026</Text>

      <Section title="1. Hizmet Tanımı">
        Kampanya Sepeti ("Uygulama"), Türkiye'deki markaların kampanya ve indirim bilgilerini
        toplayarak kullanıcılarına sunan bir bilgilendirme platformudur. Uygulama, kampanyaları
        oluşturan markalar ile herhangi bir ticari ortaklık ilişkisi içinde değildir.
      </Section>

      <Section title="2. Kullanım Şartları">
        Uygulamayı kullanarak aşağıdaki şartları kabul etmiş sayılırsınız:{'\n\n'}
        • 18 yaşından büyük olmanız veya yasal vasinin onayının bulunması gerekmektedir{'\n'}
        • Hesap bilgilerinizin güvenliğinden siz sorumlusunuz{'\n'}
        • Uygulamayı yasa dışı amaçlarla kullanamazsınız{'\n'}
        • Otomatik veri toplama araçları (bot, scraper vb.) kullanamazsınız
      </Section>

      <Section title="3. Kampanya Bilgileri">
        Uygulamada yer alan kampanya bilgileri ilgili markaların web sitelerinden otomatik olarak
        derlenmektedir. Kampanya Sepeti:{'\n\n'}
        • Kampanya içeriklerinin doğruluğunu garanti etmez{'\n'}
        • Kampanyaların geçerlilik süreleri değişiklik gösterebilir{'\n'}
        • Kampanya koşulları ilgili markanın sorumluluğundadır{'\n'}
        • Güncel bilgi için kampanyanın orijinal kaynağını kontrol etmenizi önerir
      </Section>

      <Section title="4. Üyelik ve Hesap">
        Uygulamanın temel özelliklerinden yararlanmak için üyelik oluşturmanız gerekmektedir.
        Hesabınızı istediğiniz zaman silebilirsiniz. Hesap silme işlemi ile kişisel verileriniz
        30 gün içinde kalıcı olarak silinir.
      </Section>

      <Section title="5. Abonelik ve Ödeme">
        Uygulama ücretsiz temel özellikler sunar. Premium özellikler için aylık veya yıllık
        abonelik planları mevcuttur:{'\n\n'}
        • Ödemeler Apple App Store veya Google Play Store üzerinden işlenir{'\n'}
        • Abonelikler dönem sonunda otomatik olarak yenilenir{'\n'}
        • İptal işlemi ilgili mağaza ayarlarından yapılmalıdır{'\n'}
        • İptal edilen abonelik mevcut dönem sonuna kadar aktif kalır{'\n'}
        • Ücretsiz deneme süresi sunulması halinde, süre bitiminde otomatik ücretlendirme başlar
      </Section>

      <Section title="6. Fikri Mülkiyet">
        Uygulama tasarımı, logosu, yazılımı ve özgün içerikleri Kampanya Sepeti'ne aittir.
        Kampanya görselleri ve içerikleri ilgili markaların mülkiyetindedir ve bilgilendirme
        amacıyla kullanılmaktadır.
      </Section>

      <Section title="7. Sorumluluk Sınırlaması">
        Kampanya Sepeti, aşağıdaki durumlardan sorumlu tutulamaz:{'\n\n'}
        • Kampanya bilgilerindeki hatalar veya eksiklikler{'\n'}
        • Kampanyaların sona ermesi veya koşullarının değişmesi{'\n'}
        • Kullanıcının kampanyadan yararlanamaması{'\n'}
        • Teknik arızalar nedeniyle hizmet kesintileri{'\n'}
        • Üçüncü taraf web sitelerine yönlendirmeler
      </Section>

      <Section title="8. Değişiklikler">
        Bu kullanım koşulları önceden bildirimde bulunmaksızın güncellenebilir. Önemli
        değişikliklerde uygulama içi bildirim gönderilir. Güncelleme sonrasında uygulamayı
        kullanmaya devam etmeniz, değişiklikleri kabul ettiğiniz anlamına gelir.
      </Section>

      <Section title="9. Uygulanacak Hukuk">
        Bu koşullar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda
        İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
      </Section>

      <Section title="10. İletişim">
        Sorularınız ve önerileriniz için:{'\n\n'}
        E-posta: zafer.cankaya@gmail.com
      </Section>
    </>
  );
}

function TermsContentEN() {
  return (
    <>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.date}>Last updated: March 2, 2026</Text>

      <Section title="1. Service Description">
        Kampanya Sepeti ("App") is an information platform that aggregates deals and discount
        information from brands and presents them to users. The App is not commercially
        affiliated with the brands whose deals are displayed.
      </Section>

      <Section title="2. Terms of Use">
        By using the App, you agree to the following terms:{'\n\n'}
        • You must be 18 years or older, or have parental consent{'\n'}
        • You are responsible for the security of your account{'\n'}
        • You may not use the App for illegal purposes{'\n'}
        • You may not use automated data collection tools (bots, scrapers, etc.)
      </Section>

      <Section title="3. Deal Information">
        Deal information displayed in the App is automatically compiled from brand websites.
        Kampanya Sepeti:{'\n\n'}
        • Does not guarantee the accuracy of deal content{'\n'}
        • Deal validity periods may change{'\n'}
        • Deal terms are the responsibility of the respective brand{'\n'}
        • Recommends checking the original source for current information
      </Section>

      <Section title="4. Membership and Account">
        You need to create an account to use the App's core features. You can delete your
        account at any time. Upon account deletion, your personal data will be permanently
        deleted within 30 days.
      </Section>

      <Section title="5. Subscription and Payment">
        The App offers free basic features. Monthly or yearly subscription plans are available
        for premium features:{'\n\n'}
        • Payments are processed through Apple App Store or Google Play Store{'\n'}
        • Subscriptions automatically renew at the end of each period{'\n'}
        • Cancellation must be done through the respective store settings{'\n'}
        • Cancelled subscriptions remain active until the end of the current period{'\n'}
        • If a free trial is offered, automatic billing begins when the trial ends
      </Section>

      <Section title="6. Intellectual Property">
        The App's design, logo, software, and original content belong to Kampanya Sepeti.
        Deal images and content are the property of their respective brands and are used
        for informational purposes.
      </Section>

      <Section title="7. Limitation of Liability">
        Kampanya Sepeti cannot be held responsible for:{'\n\n'}
        • Errors or omissions in deal information{'\n'}
        • Expiration or changes in deal terms{'\n'}
        • User's inability to take advantage of a deal{'\n'}
        • Service interruptions due to technical issues{'\n'}
        • Redirections to third-party websites
      </Section>

      <Section title="8. Changes">
        These terms of service may be updated without prior notice. In-app notifications
        will be sent for significant changes. Continuing to use the App after an update
        constitutes acceptance of the changes.
      </Section>

      <Section title="9. Governing Law">
        These terms are governed by the laws of the United States. Any disputes shall be
        resolved in the courts of the applicable jurisdiction.
      </Section>

      <Section title="10. Contact">
        For questions and suggestions:{'\n\n'}
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

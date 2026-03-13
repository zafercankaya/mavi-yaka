import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ExpoPushService } from './expo-push.service';
import { SubStatus, Market } from '@prisma/client';

/** Scheduled notification messages — 13 languages */
const SCHEDULED_MESSAGES: Record<string, {
  winBack: { title: string; body: (count: number) => string };
  weeklyDigest: { title: string; body: (count: number) => string };
  favoriteExpiring: { title: string; body: (campaignTitle: string) => string };
}> = {
  tr: {
    winBack: { title: 'Sizi özledik!', body: (n) => `Siz yokken ${n} yeni kampanya eklendi. Fırsatları kaçırmayın!` },
    weeklyDigest: { title: 'Haftalık Özet', body: (n) => `Bu hafta ${n} yeni kampanya eklendi. En iyi fırsatları keşfedin!` },
    favoriteExpiring: { title: 'Favori Kampanyanız Bitiyor!', body: (t) => `"${t}" kampanyası yarın sona eriyor. Son fırsatınızı kaçırmayın!` },
  },
  en: {
    winBack: { title: 'We miss you!', body: (n) => `${n} new campaigns added while you were away. Don't miss out!` },
    weeklyDigest: { title: 'Weekly Summary', body: (n) => `${n} new campaigns this week. Discover the best deals!` },
    favoriteExpiring: { title: 'Favorite Expiring!', body: (t) => `"${t}" ends tomorrow. Don't miss your last chance!` },
  },
  de: {
    winBack: { title: 'Wir vermissen Sie!', body: (n) => `${n} neue Kampagnen während Ihrer Abwesenheit. Nicht verpassen!` },
    weeklyDigest: { title: 'Wochenübersicht', body: (n) => `${n} neue Kampagnen diese Woche. Entdecken Sie die besten Angebote!` },
    favoriteExpiring: { title: 'Favorit läuft aus!', body: (t) => `„${t}" endet morgen. Letzte Chance!` },
  },
  pt: {
    winBack: { title: 'Sentimos sua falta!', body: (n) => `${n} novas campanhas enquanto você esteve fora. Não perca!` },
    weeklyDigest: { title: 'Resumo Semanal', body: (n) => `${n} novas campanhas esta semana. Descubra as melhores ofertas!` },
    favoriteExpiring: { title: 'Favorito expirando!', body: (t) => `"${t}" termina amanhã. Não perca!` },
  },
  id: {
    winBack: { title: 'Kami merindukan Anda!', body: (n) => `${n} kampanye baru saat Anda pergi. Jangan lewatkan!` },
    weeklyDigest: { title: 'Ringkasan Mingguan', body: (n) => `${n} kampanye baru minggu ini. Temukan penawaran terbaik!` },
    favoriteExpiring: { title: 'Favorit akan berakhir!', body: (t) => `"${t}" berakhir besok. Jangan lewatkan!` },
  },
  ru: {
    winBack: { title: 'Мы скучали!', body: (n) => `${n} новых акций за время вашего отсутствия. Не пропустите!` },
    weeklyDigest: { title: 'Еженедельный обзор', body: (n) => `${n} новых акций на этой неделе. Откройте лучшие предложения!` },
    favoriteExpiring: { title: 'Избранное истекает!', body: (t) => `«${t}» заканчивается завтра. Не пропустите!` },
  },
  es: {
    winBack: { title: '¡Te extrañamos!', body: (n) => `${n} nuevas campañas mientras no estabas. ¡No te las pierdas!` },
    weeklyDigest: { title: 'Resumen Semanal', body: (n) => `${n} nuevas campañas esta semana. ¡Descubre las mejores ofertas!` },
    favoriteExpiring: { title: '¡Tu favorito expira!', body: (t) => `"${t}" termina mañana. ¡No pierdas tu última oportunidad!` },
  },
  ja: {
    winBack: { title: 'お久しぶりです！', body: (n) => `お留守の間に${n}件の新キャンペーンが追加されました。お見逃しなく！` },
    weeklyDigest: { title: '週間まとめ', body: (n) => `今週${n}件の新キャンペーン。ベストディールをチェック！` },
    favoriteExpiring: { title: 'お気に入りが終了間近！', body: (t) => `「${t}」は明日終了します。最後のチャンスをお見逃しなく！` },
  },
  th: {
    winBack: { title: 'คิดถึงคุณ!', body: (n) => `มี ${n} แคมเปญใหม่ขณะที่คุณไม่อยู่ อย่าพลาด!` },
    weeklyDigest: { title: 'สรุปประจำสัปดาห์', body: (n) => `${n} แคมเปญใหม่สัปดาห์นี้ ค้นพบดีลที่ดีที่สุด!` },
    favoriteExpiring: { title: 'รายการโปรดใกล้หมดอายุ!', body: (t) => `"${t}" จะสิ้นสุดพรุ่งนี้ อย่าพลาดโอกาสสุดท้าย!` },
  },
  fr: {
    winBack: { title: 'Vous nous manquez !', body: (n) => `${n} nouvelles campagnes pendant votre absence. Ne les manquez pas !` },
    weeklyDigest: { title: 'Résumé hebdomadaire', body: (n) => `${n} nouvelles campagnes cette semaine. Découvrez les meilleures offres !` },
    favoriteExpiring: { title: 'Votre favori expire !', body: (t) => `« ${t} » se termine demain. Dernière chance !` },
  },
  it: {
    winBack: { title: 'Ci manchi!', body: (n) => `${n} nuove campagne mentre eri via. Non perderle!` },
    weeklyDigest: { title: 'Riepilogo settimanale', body: (n) => `${n} nuove campagne questa settimana. Scopri le migliori offerte!` },
    favoriteExpiring: { title: 'Il tuo preferito scade!', body: (t) => `"${t}" termina domani. Non perdere l'ultima occasione!` },
  },
  ar: {
    winBack: { title: 'افتقدناك!', body: (n) => `تمت إضافة ${n} عروض جديدة أثناء غيابك. لا تفوّتها!` },
    weeklyDigest: { title: 'ملخص الأسبوع', body: (n) => `${n} عروض جديدة هذا الأسبوع. اكتشف أفضل الصفقات!` },
    favoriteExpiring: { title: 'مفضلتك تنتهي!', body: (t) => `"${t}" ينتهي غداً. لا تفوّت الفرصة الأخيرة!` },
  },
  ko: {
    winBack: { title: '보고 싶었어요!', body: (n) => `부재 중 ${n}개의 새 캠페인이 추가되었습니다. 놓치지 마세요!` },
    weeklyDigest: { title: '주간 요약', body: (n) => `이번 주 ${n}개의 새 캠페인. 최고의 딜을 확인하세요!` },
    favoriteExpiring: { title: '즐겨찾기 만료 임박!', body: (t) => `"${t}" 내일 종료됩니다. 마지막 기회를 놓치지 마세요!` },
  },
  vi: {
    winBack: { title: 'Chúng tôi nhớ bạn!', body: (n) => `${n} ưu đãi mới khi bạn vắng mặt. Đừng bỏ lỡ!` },
    weeklyDigest: { title: 'Tổng kết tuần', body: (n) => `${n} ưu đãi mới tuần này. Khám phá ngay!` },
    favoriteExpiring: { title: 'Ưu đãi yêu thích sắp hết!', body: (t) => `"${t}" kết thúc ngày mai. Đừng bỏ lỡ!` },
  },
  pl: {
    winBack: { title: 'Tęsknimy za Tobą!', body: (n) => `${n} nowych ofert podczas Twojej nieobecności. Nie przegap!` },
    weeklyDigest: { title: 'Podsumowanie tygodnia', body: (n) => `${n} nowych ofert w tym tygodniu. Odkryj najlepsze okazje!` },
    favoriteExpiring: { title: 'Ulubiona oferta wygasa!', body: (t) => `"${t}" kończy się jutro. Nie przegap!` },
  },
  ms: {
    winBack: { title: 'Kami rindu anda!', body: (n) => `${n} tawaran baharu semasa anda tiada. Jangan lepaskan!` },
    weeklyDigest: { title: 'Ringkasan mingguan', body: (n) => `${n} tawaran baharu minggu ini. Temui tawaran terbaik!` },
    favoriteExpiring: { title: 'Kegemaran anda akan tamat!', body: (t) => `"${t}" tamat esok. Jangan lepaskan!` },
  },
  nl: {
    winBack: { title: 'We missen je!', body: (n) => `${n} nieuwe aanbiedingen terwijl je weg was. Mis ze niet!` },
    weeklyDigest: { title: 'Weekoverzicht', body: (n) => `${n} nieuwe aanbiedingen deze week. Ontdek de beste deals!` },
    favoriteExpiring: { title: 'Favoriet verloopt!', body: (t) => `"${t}" eindigt morgen. Mis je laatste kans niet!` },
  },
  ur: {
    winBack: { title: 'ہم نے آپ کو یاد کیا!', body: (n) => `آپ کی غیر موجودگی میں ${n} نئی ڈیلز شامل ہوئیں۔ موقع مت چھوڑیں!` },
    weeklyDigest: { title: 'ہفتہ وار خلاصہ', body: (n) => `اس ہفتے ${n} نئی ڈیلز۔ بہترین آفرز دریافت کریں!` },
    favoriteExpiring: { title: 'پسندیدہ ڈیل ختم ہو رہی ہے!', body: (t) => `"${t}" کل ختم ہو جائے گی۔ آخری موقع مت چھوڑیں!` },
  },
  sv: {
    winBack: { title: 'Vi saknar dig!', body: (n) => `${n} nya erbjudanden medan du var borta. Missa inte!` },
    weeklyDigest: { title: 'Veckans sammanfattning', body: (n) => `${n} nya erbjudanden denna vecka. Upptäck de bästa dealsen!` },
    favoriteExpiring: { title: 'Favorit löper ut!', body: (t) => `"${t}" slutar imorgon. Missa inte din sista chans!` },
  },
};

function getScheduledMessages(market?: Market | null) {
  const lang = MARKET_LANG[market ?? 'TR'] ?? 'en';
  return SCHEDULED_MESSAGES[lang] ?? SCHEDULED_MESSAGES['en'];
}

/** Market → notification message translations */
const NOTIF_MESSAGES: Record<string, {
  newCampaigns: (count: number) => string;
  discountOffer: (rate: number) => string;
  discover: string;
}> = {
  tr: {
    newCampaigns: (n) => `${n} yeni kampanya!`,
    discountOffer: (r) => `%${r} indirim fırsatı`,
    discover: 'Yeni kampanyayı keşfet',
  },
  en: {
    newCampaigns: (n) => `${n} new campaigns!`,
    discountOffer: (r) => `${r}% off — don't miss it!`,
    discover: 'Discover the new campaign',
  },
  de: {
    newCampaigns: (n) => `${n} neue Kampagnen!`,
    discountOffer: (r) => `${r}% Rabatt — jetzt zuschlagen!`,
    discover: 'Neue Kampagne entdecken',
  },
  pt: {
    newCampaigns: (n) => `${n} novas campanhas!`,
    discountOffer: (r) => `${r}% de desconto — aproveite!`,
    discover: 'Descubra a nova campanha',
  },
  id: {
    newCampaigns: (n) => `${n} kampanye baru!`,
    discountOffer: (r) => `Diskon ${r}% — jangan lewatkan!`,
    discover: 'Temukan kampanye baru',
  },
  ru: {
    newCampaigns: (n) => `${n} новых акций!`,
    discountOffer: (r) => `Скидка ${r}% — не пропустите!`,
    discover: 'Откройте новую акцию',
  },
  es: {
    newCampaigns: (n) => `¡${n} nuevas campañas!`,
    discountOffer: (r) => `${r}% de descuento — ¡no te lo pierdas!`,
    discover: 'Descubre la nueva campaña',
  },
  ja: {
    newCampaigns: (n) => `新しいキャンペーンが${n}件！`,
    discountOffer: (r) => `${r}%オフ — お見逃しなく！`,
    discover: '新しいキャンペーンをチェック',
  },
  th: {
    newCampaigns: (n) => `${n} แคมเปญใหม่!`,
    discountOffer: (r) => `ลด ${r}% — อย่าพลาด!`,
    discover: 'ค้นพบแคมเปญใหม่',
  },
  fr: {
    newCampaigns: (n) => `${n} nouvelles campagnes !`,
    discountOffer: (r) => `${r}% de réduction — profitez-en !`,
    discover: 'Découvrez la nouvelle campagne',
  },
  it: {
    newCampaigns: (n) => `${n} nuove campagne!`,
    discountOffer: (r) => `${r}% di sconto — non perderlo!`,
    discover: 'Scopri la nuova campagna',
  },
  ar: {
    newCampaigns: (n) => `${n} عروض جديدة!`,
    discountOffer: (r) => `خصم ${r}% — لا تفوّت الفرصة!`,
    discover: 'اكتشف العرض الجديد',
  },
  ko: {
    newCampaigns: (n) => `${n}개의 새로운 딜!`,
    discountOffer: (r) => `${r}% 할인 — 놓치지 마세요!`,
    discover: '새로운 딜 확인하기',
  },
  vi: {
    newCampaigns: (n) => `${n} ưu đãi mới!`,
    discountOffer: (r) => `Giảm ${r}% — đừng bỏ lỡ!`,
    discover: 'Khám phá ưu đãi mới',
  },
  pl: {
    newCampaigns: (n) => `${n} nowych ofert!`,
    discountOffer: (r) => `${r}% zniżki — nie przegap!`,
    discover: 'Odkryj nową ofertę',
  },
  ms: {
    newCampaigns: (n) => `${n} tawaran baharu!`,
    discountOffer: (r) => `Diskaun ${r}% — jangan lepaskan!`,
    discover: 'Temui tawaran baharu',
  },
  nl: {
    newCampaigns: (n) => `${n} nieuwe aanbiedingen!`,
    discountOffer: (r) => `${r}% korting — mis het niet!`,
    discover: 'Ontdek de nieuwe aanbieding',
  },
  ur: {
    newCampaigns: (n) => `${n} نئی ڈیلز!`,
    discountOffer: (r) => `${r}% ڈسکاؤنٹ — موقع مت چھوڑیں!`,
    discover: 'نئی ڈیل دریافت کریں',
  },
  sv: {
    newCampaigns: (n) => `${n} nya erbjudanden!`,
    discountOffer: (r) => `${r}% rabatt — missa inte!`,
    discover: 'Upptäck det nya erbjudandet',
  },
};

const MARKET_LANG: Record<string, string> = {
  TR: 'tr', US: 'en', UK: 'en', AU: 'en', CA: 'en',
  DE: 'de', BR: 'pt', ID: 'id', RU: 'ru', MX: 'es',
  JP: 'ja', PH: 'en', TH: 'th', FR: 'fr', IT: 'it',
  IN: 'en',
  ES: 'es', AR: 'es',
  EG: 'ar', SA: 'ar', AE: 'ar',
  KR: 'ko',
  VN: 'vi', PL: 'pl', MY: 'ms', CO: 'es', ZA: 'en', PT: 'pt',
  NL: 'nl', PK: 'ur', SE: 'sv',
};

/** Referral notification messages — 13 languages */
const REFERRAL_MESSAGES: Record<string, Record<'activated' | 'referred', { title: string; body: string }>> = {
  tr: {
    activated: { title: 'Premium Deneme Aktif!', body: '7 gün Premium hediye! Tüm markalardan bildirim alın.' },
    referred: { title: 'Davet Ödülü!', body: 'Arkadaşınız katıldı! 7 gün Premium hediye kazandınız.' },
  },
  en: {
    activated: { title: 'Premium Trial Active!', body: '7 days free Premium! Get notifications from all brands.' },
    referred: { title: 'Referral Reward!', body: 'Your friend joined! You earned 7 days free Premium.' },
  },
  de: {
    activated: { title: 'Premium-Test aktiv!', body: '7 Tage Premium gratis! Benachrichtigungen von allen Marken.' },
    referred: { title: 'Empfehlungsbonus!', body: 'Ihr Freund ist beigetreten! 7 Tage Premium erhalten.' },
  },
  pt: {
    activated: { title: 'Teste Premium Ativo!', body: '7 dias de Premium grátis! Notificações de todas as marcas.' },
    referred: { title: 'Recompensa de Indicação!', body: 'Seu amigo entrou! Você ganhou 7 dias de Premium.' },
  },
  id: {
    activated: { title: 'Uji Coba Premium Aktif!', body: '7 hari Premium gratis! Notifikasi dari semua merek.' },
    referred: { title: 'Hadiah Referral!', body: 'Teman Anda bergabung! 7 hari Premium untuk Anda.' },
  },
  ru: {
    activated: { title: 'Пробный Premium активен!', body: '7 дней Premium бесплатно! Уведомления от всех брендов.' },
    referred: { title: 'Бонус за приглашение!', body: 'Ваш друг присоединился! 7 дней Premium для вас.' },
  },
  es: {
    activated: { title: '¡Prueba Premium activa!', body: '7 días de Premium gratis. Notificaciones de todas las marcas.' },
    referred: { title: '¡Recompensa por invitación!', body: 'Tu amigo se unió. 7 días de Premium para ti.' },
  },
  ja: {
    activated: { title: 'プレミアム体験開始！', body: '7日間無料プレミアム！すべてのブランドから通知を受け取れます。' },
    referred: { title: '紹介ボーナス！', body: 'お友達が参加しました！7日間無料プレミアムを獲得。' },
  },
  th: {
    activated: { title: 'ทดลอง Premium เริ่มแล้ว!', body: 'Premium ฟรี 7 วัน! รับการแจ้งเตือนจากทุกแบรนด์' },
    referred: { title: 'รางวัลแนะนำเพื่อน!', body: 'เพื่อนของคุณเข้าร่วมแล้ว! รับ Premium ฟรี 7 วัน' },
  },
  fr: {
    activated: { title: 'Essai Premium activé !', body: '7 jours Premium gratuits ! Notifications de toutes les marques.' },
    referred: { title: 'Récompense de parrainage !', body: 'Votre ami a rejoint ! 7 jours Premium offerts.' },
  },
  it: {
    activated: { title: 'Prova Premium attiva!', body: '7 giorni di Premium gratis! Notifiche da tutti i brand.' },
    referred: { title: 'Premio referral!', body: 'Il tuo amico si è iscritto! 7 giorni Premium per te.' },
  },
  ar: {
    activated: { title: 'تجربة Premium مفعّلة!', body: '7 أيام Premium مجاناً! إشعارات من جميع العلامات التجارية.' },
    referred: { title: 'مكافأة الدعوة!', body: 'انضم صديقك! حصلت على 7 أيام Premium مجاناً.' },
  },
  ko: {
    activated: { title: 'Premium 체험 시작!', body: '7일 무료 Premium! 모든 브랜드 알림을 받으세요.' },
    referred: { title: '추천 보상!', body: '친구가 가입했습니다! 7일 무료 Premium 획득.' },
  },
  vi: {
    activated: { title: 'Dùng thử Premium!', body: '7 ngày Premium miễn phí! Nhận thông báo từ tất cả thương hiệu.' },
    referred: { title: 'Thưởng giới thiệu!', body: 'Bạn bè đã tham gia! Bạn nhận 7 ngày Premium miễn phí.' },
  },
  pl: {
    activated: { title: 'Premium aktywny!', body: '7 dni Premium za darmo! Powiadomienia od wszystkich marek.' },
    referred: { title: 'Nagroda za polecenie!', body: 'Twój znajomy dołączył! Otrzymujesz 7 dni Premium.' },
  },
  ms: {
    activated: { title: 'Percubaan Premium aktif!', body: '7 hari Premium percuma! Notifikasi dari semua jenama.' },
    referred: { title: 'Ganjaran rujukan!', body: 'Rakan anda menyertai! Anda mendapat 7 hari Premium.' },
  },
  nl: {
    activated: { title: 'Premium proefperiode actief!', body: '7 dagen gratis Premium! Meldingen van alle merken.' },
    referred: { title: 'Verwijzingsbeloning!', body: 'Je vriend is lid geworden! 7 dagen gratis Premium voor jou.' },
  },
  ur: {
    activated: { title: 'Premium ٹرائل فعال!', body: '7 دن مفت Premium! تمام برانڈز سے اطلاعات حاصل کریں۔' },
    referred: { title: 'ریفرل انعام!', body: 'آپ کا دوست شامل ہو گیا! آپ کو 7 دن مفت Premium ملا۔' },
  },
  sv: {
    activated: { title: 'Premium-provperiod aktiv!', body: '7 dagars gratis Premium! Aviseringar från alla varumärken.' },
    referred: { title: 'Värvningsbelöning!', body: 'Din vän gick med! Du får 7 dagars gratis Premium.' },
  },
};

function getMessages(market?: Market | null) {
  const lang = MARKET_LANG[market ?? 'TR'] ?? 'en';
  return NOTIF_MESSAGES[lang] ?? NOTIF_MESSAGES['en'];
}

/** Start of today (UTC) for daily notification counting */
function startOfTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly expoPush: ExpoPushService,
  ) {}

  /**
   * Crawl sonrası yeni bulunan kampanyalar için bildirim gönder.
   * O kampanyanın marka veya kategorisini takip eden kullanıcılara push gönderir.
   * Plan limitine göre günlük bildirim sayısını kontrol eder.
   */
  async notifyNewCampaigns(
    brandId: string,
    categoryId: string | null,
    campaigns: Array<{ id: string; title: string; discountRate?: number | null }>,
  ): Promise<void> {
    if (!this.expoPush.isEnabled || campaigns.length === 0) return;

    // Get brand's market to determine notification language
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
      select: { market: true },
    });
    const brandMarket = brand?.market ?? Market.TR;

    // Find users following this brand or category, include subscription info
    const follows = await this.prisma.follow.findMany({
      where: {
        isFrozen: false, // Frozen takipler bildirim almaz
        OR: [
          { brandId },
          ...(categoryId ? [{ categoryId }] : []),
        ],
      },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            market: true,
            subscription: {
              select: {
                status: true,
                currentPeriodEnd: true,
                plan: { select: { dailyNotifLimit: true } },
              },
            },
          },
        },
      },
    });

    // Deduplicate users and build a map with their limits + market
    const userMap = new Map<string, { limit: number; market: Market }>();
    for (const f of follows) {
      if (userMap.has(f.userId)) continue;

      const sub = f.user.subscription;
      const isActive =
        sub &&
        (sub.status === SubStatus.ACTIVE || sub.status === SubStatus.GRACE_PERIOD) &&
        (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date());

      const dailyLimit = isActive ? sub!.plan.dailyNotifLimit : 1; // Free: 1/gün
      userMap.set(f.userId, { limit: dailyLimit, market: f.user.market });
    }

    if (userMap.size === 0) return;

    // Filter out users who disabled notifications
    const prefs = await this.prisma.notificationPreference.findMany({
      where: { userId: { in: Array.from(userMap.keys()) }, enabled: false },
      select: { userId: true },
    });
    const disabledUsers = new Set(prefs.map((p) => p.userId));

    // Filter users who haven't exceeded their daily limit and have notifications enabled
    // DB-based daily count — survives API restarts
    const todayStart = startOfTodayUTC();
    const todayCounts = await this.prisma.notification.groupBy({
      by: ['userId'],
      where: {
        userId: { in: Array.from(userMap.keys()) },
        createdAt: { gte: todayStart },
      },
      _count: { id: true },
    });
    const countMap = new Map(todayCounts.map((c) => [c.userId, c._count.id]));

    const eligibleUserIds: string[] = [];
    for (const [userId, { limit }] of userMap) {
      if (disabledUsers.has(userId)) continue;
      const sent = countMap.get(userId) ?? 0;
      // -1 = sınırsız
      if (limit === -1 || sent < limit) {
        eligibleUserIds.push(userId);
      }
    }

    if (eligibleUserIds.length === 0) {
      this.logger.log('All users exceeded daily notification limit');
      return;
    }

    // Dedup: filter out users who already received notification for these campaigns
    const campaignIds = campaigns.map(c => c.id);
    const alreadySent = await this.prisma.$queryRawUnsafe<{ user_id: string; campaign_id: string }[]>(
      `SELECT DISTINCT user_id, data->>'campaignId' as campaign_id
       FROM notifications
       WHERE user_id = ANY($1::text[])
       AND data->>'campaignId' = ANY($2::text[])`,
      eligibleUserIds,
      campaignIds,
    );
    const sentSet = new Set(alreadySent.map(n => `${n.user_id}:${n.campaign_id}`));

    // For single campaign: filter out users who already got it
    // For multi campaign: we use first campaign's id as pushData key, so filter by that
    const firstCampaignId = campaigns[0].id;
    const dedupedUserIds = eligibleUserIds.filter(
      uid => !sentSet.has(`${uid}:${firstCampaignId}`),
    );

    if (dedupedUserIds.length === 0) {
      this.logger.log('All users already notified for these campaigns (dedup)');
      return;
    }

    this.logger.log(
      `Notifying ${dedupedUserIds.length}/${userMap.size} users about ${campaigns.length} new campaigns (${eligibleUserIds.length - dedupedUserIds.length} deduped)`,
    );

    // Get FCM tokens for eligible users
    const fcmTokens = await this.prisma.fcmToken.findMany({
      where: { userId: { in: dedupedUserIds } },
      select: { token: true, userId: true },
    });

    if (fcmTokens.length === 0) return;

    const campaign = campaigns[0];
    const pushData = {
      type: 'new_campaign',
      campaignId: campaign.id,
      brandId,
    };

    // Use brand's market for notification language — ensures title+body are in the same language
    const msg = getMessages(brandMarket);
    const allTokens = fcmTokens.map((t) => t.token);

    const title =
      campaigns.length === 1
        ? campaign.title
        : msg.newCampaigns(campaigns.length);

    const body =
      campaigns.length === 1
        ? campaign.discountRate
          ? msg.discountOffer(Number(campaign.discountRate))
          : msg.discover
        : `${campaigns.map((c) => c.title).slice(0, 3).join(', ')}`;

    const result = await this.expoPush.sendToTokens(allTokens, title, body, pushData);
    const allInvalidTokens = [...result.invalidTokens];

    // Build in-app notification records
    const notifRecords: Array<{ userId: string; title: string; body: string; data: any }> = [];
    const allUserIds = new Set(fcmTokens.map((t) => t.userId));
    for (const uid of allUserIds) {
      notifRecords.push({ userId: uid, title, body, data: pushData as any });
    }

    // Remove stale/invalid tokens from DB
    if (allInvalidTokens.length > 0) {
      this.logger.warn(`Removing ${allInvalidTokens.length} stale push tokens`);
      await this.prisma.fcmToken.deleteMany({
        where: { token: { in: allInvalidTokens } },
      });
    }

    // Save in-app notification records
    if (notifRecords.length > 0) {
      await this.prisma.notification.createMany({ data: notifRecords });
    }

    // Daily counts are now tracked via Notification records in DB — no in-memory counter needed
  }

  /**
   * Referral trial aktivasyonu için kullanıcıya push bildirim gönder.
   * Kullanıcının market'ine göre doğru dilde mesaj gönderir.
   */
  async sendReferralNotification(
    userId: string,
    type: 'activated' | 'referred',
  ): Promise<void> {
    if (!this.expoPush.isEnabled) return;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { market: true, fcmTokens: { select: { token: true } } },
    });
    if (!user || user.fcmTokens.length === 0) return;

    const lang = MARKET_LANG[user.market] ?? 'en';
    const msg = REFERRAL_MESSAGES[lang]?.[type] ?? REFERRAL_MESSAGES['en'][type];

    const tokens = user.fcmTokens.map((t) => t.token);
    const pushData = { type: 'referral', action: type };

    await this.expoPush.sendToTokens(tokens, msg.title, msg.body, pushData);

    // Save in-app notification record
    await this.prisma.notification.create({
      data: { userId, title: msg.title, body: msg.body, data: pushData as any },
    });
  }

  /**
   * Bildirim tercihlerini getir (yoksa default olustur)
   */
  async getPreferences(userId: string) {
    let pref = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });
    if (!pref) {
      pref = await this.prisma.notificationPreference.create({
        data: { userId },
      });
    }
    return pref;
  }

  /**
   * Bildirim tercihlerini guncelle
   */
  async updatePreferences(userId: string, data: { enabled?: boolean }) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: { ...data },
      create: { userId, ...data },
    });
  }

  /**
   * Kullanıcının bildirim inbox'ını getir (yeniden eskiye).
   */
  async getInbox(userId: string, cursor?: string, limit = 20) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    const hasMore = notifications.length > limit;
    const items = hasMore ? notifications.slice(0, limit) : notifications;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { data: items, meta: { nextCursor, hasMore } };
  }

  /**
   * Bildirimi okundu olarak işaretle.
   */
  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  /**
   * Okunmamış bildirim sayısı.
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  // ─── Scheduled Notifications ───────────────────────────

  /**
   * Win-back: 7 gün uygulamayı açmamış kullanıcılara bildirim gönder.
   * "Sizi özledik, X yeni kampanya var"
   */
  async sendWinBackNotifications(markets?: Market[]): Promise<{ sent: number }> {
    if (!this.expoPush.isEnabled) return { sent: 0 };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find inactive users with push tokens who haven't been active in 7+ days
    const inactiveUsers = await this.prisma.user.findMany({
      where: {
        lastActivityAt: { lt: sevenDaysAgo },
        fcmTokens: { some: {} },
        OR: [{ notifPref: null }, { notifPref: { enabled: true } }],
        ...(markets ? { market: { in: markets } } : {}),
      },
      select: {
        id: true,
        market: true,
        fcmTokens: { select: { token: true } },
      },
      take: 500, // batch limit
    });

    if (inactiveUsers.length === 0) return { sent: 0 };

    let sent = 0;
    for (const user of inactiveUsers) {
      // Count new campaigns in user's market since last activity
      const newCount = await this.prisma.campaign.count({
        where: {
          market: user.market,
          status: 'ACTIVE',
          createdAt: { gte: sevenDaysAgo },
        },
      });
      if (newCount === 0) continue;

      const msg = getScheduledMessages(user.market);
      const title = msg.winBack.title;
      const body = msg.winBack.body(newCount);
      const tokens = user.fcmTokens.map(t => t.token);
      const pushData = { type: 'win_back' };

      const result = await this.expoPush.sendToTokens(tokens, title, body, pushData);
      if (result.invalidTokens.length > 0) {
        await this.prisma.fcmToken.deleteMany({ where: { token: { in: result.invalidTokens } } });
      }

      await this.prisma.notification.create({
        data: { userId: user.id, title, body, data: pushData as any },
      });
      sent++;
    }

    this.logger.log(`Win-back notifications sent: ${sent}`);
    return { sent };
  }

  /**
   * Haftalık özet: Bu hafta eklenen kampanya sayısını bildir.
   * Premium kullanıcılara gönderilir (weeklyDigest: true).
   */
  async sendWeeklySummary(markets?: Market[]): Promise<{ sent: number }> {
    if (!this.expoPush.isEnabled) return { sent: 0 };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Find premium users with weeklyDigest enabled
    const eligibleUsers = await this.prisma.user.findMany({
      where: {
        AND: [
          { fcmTokens: { some: {} } },
          { OR: [{ notifPref: null }, { notifPref: { enabled: true } }] },
          {
            subscription: {
              status: { in: ['ACTIVE', 'GRACE_PERIOD'] },
              plan: { weeklyDigest: true },
            },
          },
          ...(markets ? [{ market: { in: markets } as any }] : []),
        ],
      },
      select: {
        id: true,
        market: true,
        fcmTokens: { select: { token: true } },
      },
    });

    if (eligibleUsers.length === 0) return { sent: 0 };

    // Count new campaigns per market this week
    const marketCounts = new Map<string, number>();

    let sent = 0;
    for (const user of eligibleUsers) {
      const marketKey = user.market;
      if (!marketCounts.has(marketKey)) {
        const count = await this.prisma.campaign.count({
          where: {
            market: user.market,
            status: 'ACTIVE',
            createdAt: { gte: oneWeekAgo },
          },
        });
        marketCounts.set(marketKey, count);
      }

      const newCount = marketCounts.get(marketKey) ?? 0;
      if (newCount === 0) continue;

      const msg = getScheduledMessages(user.market);
      const title = msg.weeklyDigest.title;
      const body = msg.weeklyDigest.body(newCount);
      const tokens = user.fcmTokens.map(t => t.token);
      const pushData = { type: 'weekly_digest' };

      const result = await this.expoPush.sendToTokens(tokens, title, body, pushData);
      if (result.invalidTokens.length > 0) {
        await this.prisma.fcmToken.deleteMany({ where: { token: { in: result.invalidTokens } } });
      }

      await this.prisma.notification.create({
        data: { userId: user.id, title, body, data: pushData as any },
      });
      sent++;
    }

    this.logger.log(`Weekly summary notifications sent: ${sent}`);
    return { sent };
  }

  /**
   * Favori kampanya bitiş bildirimi: endDate'e 1 gün kala bildirim gönder.
   * Tüm kullanıcılara gönderilir (free + premium).
   */
  async sendExpiringFavoriteNotifications(markets?: Market[]): Promise<{ sent: number }> {
    if (!this.expoPush.isEnabled) return { sent: 0 };

    // Tomorrow date range (start of tomorrow to end of tomorrow, UTC)
    const now = new Date();
    const tomorrowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const tomorrowEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 2));

    // Find favorites where campaign endDate is tomorrow
    const expiringFavorites = await this.prisma.favorite.findMany({
      where: {
        isFrozen: false,
        campaign: {
          status: 'ACTIVE',
          endDate: { gte: tomorrowStart, lt: tomorrowEnd },
          ...(markets ? { market: { in: markets } } : {}),
        },
      },
      select: {
        userId: true,
        campaign: { select: { id: true, title: true } },
        user: {
          select: {
            id: true,
            market: true,
            notifPref: { select: { enabled: true } },
            fcmTokens: { select: { token: true } },
          },
        },
      },
    });

    if (expiringFavorites.length === 0) return { sent: 0 };

    // Dedup: check which (userId, campaignId) pairs already received expiring notification
    const userCampaignPairs = expiringFavorites.map(f => ({ userId: f.userId, campaignId: f.campaign.id }));
    const uniqueUserIds = [...new Set(userCampaignPairs.map(p => p.userId))];
    const uniqueCampaignIds = [...new Set(userCampaignPairs.map(p => p.campaignId))];

    const alreadySent = await this.prisma.$queryRawUnsafe<{ user_id: string; campaign_id: string }[]>(
      `SELECT DISTINCT user_id, data->>'campaignId' as campaign_id
       FROM notifications
       WHERE user_id = ANY($1::text[])
       AND data->>'campaignId' = ANY($2::text[])
       AND data->>'type' = 'favorite_expiring'`,
      uniqueUserIds,
      uniqueCampaignIds,
    );
    const sentSet = new Set(alreadySent.map(n => `${n.user_id}:${n.campaign_id}`));

    let sent = 0;
    for (const fav of expiringFavorites) {
      // Skip if user disabled notifications or has no tokens
      if (fav.user.notifPref?.enabled === false) continue;
      if (fav.user.fcmTokens.length === 0) continue;

      // Skip if already sent expiring notification for this campaign to this user
      if (sentSet.has(`${fav.userId}:${fav.campaign.id}`)) continue;

      const msg = getScheduledMessages(fav.user.market);
      const title = msg.favoriteExpiring.title;
      const body = msg.favoriteExpiring.body(fav.campaign.title);
      const tokens = fav.user.fcmTokens.map(t => t.token);
      const pushData = { type: 'favorite_expiring', campaignId: fav.campaign.id };

      const result = await this.expoPush.sendToTokens(tokens, title, body, pushData);
      if (result.invalidTokens.length > 0) {
        await this.prisma.fcmToken.deleteMany({ where: { token: { in: result.invalidTokens } } });
      }

      await this.prisma.notification.create({
        data: { userId: fav.userId, title, body, data: pushData as any },
      });
      sent++;
    }

    this.logger.log(`Expiring favorite notifications sent: ${sent}`);
    return { sent };
  }

  /**
   * FCM token kaydet (mobil app'ten gelen)
   */
  async registerToken(userId: string, token: string, platform: 'IOS' | 'ANDROID', market?: Market): Promise<void> {
    await this.prisma.fcmToken.upsert({
      where: { token },
      update: { userId, platform },
      create: { userId, token, platform },
    });

    // Sync user's market + update last activity timestamp
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastActivityAt: new Date(),
        ...(market ? { market } : {}),
      },
    });
  }

  /**
   * FCM token sil
   */
  async removeToken(token: string): Promise<void> {
    await this.prisma.fcmToken.deleteMany({ where: { token } });
  }
}

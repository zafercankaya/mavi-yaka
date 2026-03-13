import { Controller, Get, Header } from '@nestjs/common';

@Controller()
export class PrivacyController {
  @Get('privacy-policy')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getPrivacyPolicy(): string {
    return PRIVACY_HTML;
  }
}

const PRIVACY_HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kampanya Sepeti - Gizlilik Politikası / Privacy Policy</title>
    <style>
        :root{--primary:#e53e3e;--primary-dark:#c53030;--bg:#fff;--bg-alt:#f7f7f8;--text:#1a1a2e;--text-muted:#64748b;--border:#e2e8f0;--accent:#2563eb}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:var(--text);background:var(--bg);line-height:1.7;font-size:16px}
        .header{background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#fff;padding:48px 24px;text-align:center}
        .header h1{font-size:2rem;font-weight:700;margin-bottom:8px}.header p{font-size:1rem;opacity:.9}
        .lang-switcher{display:flex;justify-content:center;gap:12px;padding:24px;background:var(--bg-alt);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}
        .lang-btn{padding:10px 28px;border:2px solid var(--primary);background:#fff;color:var(--primary);border-radius:8px;cursor:pointer;font-size:.95rem;font-weight:600;transition:all .2s}
        .lang-btn:hover{background:#fff5f5}.lang-btn.active{background:var(--primary);color:#fff}
        .container{max-width:800px;margin:0 auto;padding:40px 24px 80px}
        .lang-section{display:none}.lang-section.active{display:block}
        .effective-date{display:inline-block;background:var(--bg-alt);border:1px solid var(--border);padding:8px 16px;border-radius:6px;font-size:.9rem;color:var(--text-muted);margin-bottom:32px}
        h2{font-size:1.5rem;font-weight:700;margin-top:40px;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid var(--primary)}
        h3{font-size:1.15rem;font-weight:600;margin-top:24px;margin-bottom:10px}
        p{margin-bottom:14px;color:#334155}ul,ol{margin-bottom:14px;padding-left:24px}li{margin-bottom:6px;color:#334155}
        .data-table{width:100%;border-collapse:collapse;margin:16px 0 24px;font-size:.95rem}
        .data-table th,.data-table td{padding:12px 16px;text-align:left;border:1px solid var(--border)}
        .data-table th{background:var(--bg-alt);font-weight:600}.data-table tr:nth-child(even) td{background:#fafafa}
        .tp-card{background:var(--bg-alt);border:1px solid var(--border);border-radius:10px;padding:20px;margin-bottom:16px}
        .tp-card h4{font-size:1.05rem;font-weight:600;margin-bottom:8px;color:var(--primary-dark)}
        .tp-card p{font-size:.93rem;margin-bottom:6px}.tp-card a{color:var(--accent);text-decoration:none}
        .rights-list{list-style:none;padding:0}.rights-list li{padding:10px 0 10px 32px;position:relative;border-bottom:1px solid var(--border)}
        .rights-list li::before{content:"\\2713";position:absolute;left:0;top:10px;color:var(--primary);font-weight:700;font-size:1.1rem}
        .contact-box{background:linear-gradient(135deg,#fff5f5,#fef2f2);border:1px solid #fecaca;border-radius:12px;padding:28px;margin-top:24px}
        .contact-box a{color:var(--accent);text-decoration:none}
        .footer{text-align:center;padding:24px;color:var(--text-muted);font-size:.85rem;border-top:1px solid var(--border)}
        @media(max-width:600px){.header h1{font-size:1.5rem}.container{padding:24px 16px 60px}h2{font-size:1.25rem}.data-table{font-size:.85rem}.data-table th,.data-table td{padding:8px 10px}}
    </style>
</head>
<body>
<div class="header"><h1>Kampanya Sepeti</h1><p>Gizlilik Politikası / Privacy Policy</p></div>
<div class="lang-switcher">
    <button class="lang-btn active" onclick="switchLang('tr')" id="btn-tr">Türkçe</button>
    <button class="lang-btn" onclick="switchLang('en')" id="btn-en">English</button>
</div>
<div class="container">
<div class="lang-section active" id="section-tr">
<span class="effective-date">Yürürlük Tarihi: 3 Mart 2026</span>
<p>Kampanya Sepeti ("Uygulama"), com.kampanyasepeti.app paket adlı mobil uygulamamızı kullanan kullanıcılarımızın kişisel verilerinin korunmasına büyük önem vermektedir. Bu Gizlilik Politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında hazırlanmıştır.</p>

<h2>1. Veri Sorumlusu</h2>
<p><strong>Unvan:</strong> zafer77can (Bireysel Geliştirici)<br><strong>Uygulama:</strong> Kampanya Sepeti<br><strong>Paket Adı:</strong> com.kampanyasepeti.app<br><strong>E-posta:</strong> zafer.cankaya@gmail.com</p>

<h2>2. Toplanan Kişisel Veriler</h2>
<table class="data-table">
<thead><tr><th>Veri Kategorisi</th><th>Toplanan Veriler</th><th>Toplama Yöntemi</th></tr></thead>
<tbody>
<tr><td><strong>Kimlik Bilgileri</strong></td><td>E-posta adresi, görüntü adı (isteğe bağlı)</td><td>Kayıt formu / Sosyal giriş</td></tr>
<tr><td><strong>Hesap Güvenlik</strong></td><td>Şifreli parola, kimlik doğrulama sağlayıcısı (Email/Google/Apple)</td><td>Kayıt / Giriş</td></tr>
<tr><td><strong>Cihaz Bilgileri</strong></td><td>FCM token, cihaz platformu (iOS/Android)</td><td>Bildirim izni verildiğinde</td></tr>
<tr><td><strong>Kullanım Verileri</strong></td><td>Takip edilen markalar, favori kampanyalar, bildirim tercihleri</td><td>Uygulama içi etkileşimler</td></tr>
<tr><td><strong>Abonelik</strong></td><td>Abonelik planı, durumu, ödeme sağlayıcısı, dönem bilgisi</td><td>Uygulama içi satın alma</td></tr>
<tr><td><strong>Teknik Veriler</strong></td><td>Hata raporları, performans verileri</td><td>Sentry SDK (otomatik)</td></tr>
</tbody></table>

<h3>Toplamadığımız Veriler</h3>
<ul><li>Konum bilgisi</li><li>Rehber/kişiler listesi</li><li>Telefon numarası</li><li>Fotoğraf, kamera veya mikrofon erişimi</li><li>Reklam kimliği (IDFA/GAID)</li></ul>

<h2>3. Verilerin İşlenme Amacı</h2>
<ol>
<li><strong>Hesap yönetimi:</strong> Kayıt, giriş ve kimlik doğrulama</li>
<li><strong>Hizmet sunumu:</strong> Kampanya bilgilerinin listelenmesi ve sunulması</li>
<li><strong>Kişiselleştirme:</strong> Takip edilen markalara göre içerik önceliklendirmesi</li>
<li><strong>Bildirimler:</strong> Yeni kampanya bildirimleri (izninize bağlı)</li>
<li><strong>Abonelik yönetimi:</strong> Premium abonelik işlemleri</li>
<li><strong>Hata takibi:</strong> Uygulama hatalarının tespiti ve giderilmesi</li>
</ol>

<h2>4. Üçüncü Taraf Hizmetler</h2>
<p>Kişisel verileriniz hiçbir koşulda satılmaz.</p>
<div class="tp-card"><h4>Google Sign-In</h4><p><strong>Amaç:</strong> Google hesabı ile giriş</p><p><strong>Paylaşılan:</strong> E-posta, ad, Google kullanıcı ID</p><p><a href="https://policies.google.com/privacy">Google Gizlilik Politikası</a></p></div>
<div class="tp-card"><h4>Apple Sign In</h4><p><strong>Amaç:</strong> Apple hesabı ile giriş (iOS)</p><p><strong>Paylaşılan:</strong> E-posta, Apple kullanıcı ID</p><p><a href="https://www.apple.com/legal/privacy/">Apple Gizlilik Politikası</a></p></div>
<div class="tp-card"><h4>RevenueCat</h4><p><strong>Amaç:</strong> Abonelik yönetimi</p><p><strong>Paylaşılan:</strong> Kullanıcı UUID, abonelik durumu</p><p><a href="https://www.revenuecat.com/privacy">RevenueCat Gizlilik Politikası</a></p></div>
<div class="tp-card"><h4>Firebase (FCM)</h4><p><strong>Amaç:</strong> Push bildirim</p><p><strong>Paylaşılan:</strong> FCM token, platform bilgisi</p><p><a href="https://firebase.google.com/support/privacy">Firebase Gizlilik Politikası</a></p></div>
<div class="tp-card"><h4>Sentry</h4><p><strong>Amaç:</strong> Hata izleme</p><p><strong>Paylaşılan:</strong> Hata raporları, cihaz bilgileri</p><p><a href="https://sentry.io/privacy/">Sentry Gizlilik Politikası</a></p></div>

<h2>5. Veri Güvenliği</h2>
<ul>
<li>Parolalar bcrypt (12 round) ile şifrelenir</li>
<li>JWT: erişim tokeni 15 dk, yenileme tokeni 30 gün</li>
<li>Mobil cihazda tokenler Expo SecureStore ile şifreli saklanır</li>
<li>API iletişimi HTTPS ile şifrelenir</li>
</ul>

<h2>6. Kullanıcı Hakları (KVKK Madde 11)</h2>
<ul class="rights-list">
<li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
<li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
<li>Verilerin aktarıldığı üçüncü kişileri bilme</li>
<li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
<li>KVKK Madde 7 kapsamında silinmesini veya yok edilmesini isteme</li>
<li>Otomatik analiz sonucu aleyhinize bir sonuç çıkmasına itiraz etme</li>
<li>Kanuna aykırı işleme sebebiyle zararın giderilmesini talep etme</li>
</ul>

<h2>7. Çocukların Gizliliği</h2>
<p>Kampanya Sepeti 13 yaşından küçük çocuklara yönelik değildir.</p>

<h2>8. Politika Değişiklikleri</h2>
<p>Bu politika güncellenebilir. Önemli değişikliklerde uygulama içi bildirim yapılır.</p>

<h2>9. İletişim</h2>
<div class="contact-box"><p><strong>Geliştirici:</strong> zafer77can</p><p><strong>E-posta:</strong> zafer.cankaya@gmail.com</p><p><strong>Uygulama:</strong> Kampanya Sepeti (com.kampanyasepeti.app)</p></div>
</div>

<!-- ENGLISH -->
<div class="lang-section" id="section-en">
<span class="effective-date">Effective Date: March 3, 2026</span>
<p>Kampanya Sepeti ("Application"), operating under package name com.kampanyasepeti.app, is committed to protecting the personal data of our users. This Privacy Policy complies with the Turkish Personal Data Protection Law No. 6698 (KVKK).</p>

<h2>1. Data Controller</h2>
<p><strong>Name:</strong> zafer77can (Individual Developer)<br><strong>App:</strong> Kampanya Sepeti<br><strong>Package:</strong> com.kampanyasepeti.app<br><strong>Email:</strong> zafer.cankaya@gmail.com</p>

<h2>2. Data We Collect</h2>
<table class="data-table">
<thead><tr><th>Category</th><th>Data</th><th>Method</th></tr></thead>
<tbody>
<tr><td><strong>Identity</strong></td><td>Email, display name (optional)</td><td>Registration / Social login</td></tr>
<tr><td><strong>Security</strong></td><td>Hashed password, auth provider (Email/Google/Apple)</td><td>Registration / Login</td></tr>
<tr><td><strong>Device</strong></td><td>FCM token, platform (iOS/Android)</td><td>When notification permission granted</td></tr>
<tr><td><strong>Usage</strong></td><td>Followed brands, favorites, notification preferences</td><td>In-app interactions</td></tr>
<tr><td><strong>Subscription</strong></td><td>Plan, status, provider, period</td><td>In-app purchases</td></tr>
<tr><td><strong>Technical</strong></td><td>Error reports, performance data</td><td>Sentry SDK (automatic)</td></tr>
</tbody></table>

<h3>Data We Do NOT Collect</h3>
<ul><li>Location data</li><li>Contacts</li><li>Phone number</li><li>Photos, camera or microphone</li><li>Advertising IDs (IDFA/GAID)</li></ul>

<h2>3. Purpose</h2>
<ol>
<li>Account management and authentication</li>
<li>Campaign listing and delivery</li>
<li>Content personalization</li>
<li>Push notifications (with consent)</li>
<li>Subscription management</li>
<li>Error tracking and resolution</li>
</ol>

<h2>4. Third-Party Services</h2>
<p>Your data is never sold to third parties.</p>
<div class="tp-card"><h4>Google Sign-In</h4><p>Email, name, Google user ID</p><p><a href="https://policies.google.com/privacy">Google Privacy Policy</a></p></div>
<div class="tp-card"><h4>Apple Sign In</h4><p>Email, Apple user ID</p><p><a href="https://www.apple.com/legal/privacy/">Apple Privacy Policy</a></p></div>
<div class="tp-card"><h4>RevenueCat</h4><p>User UUID, subscription status</p><p><a href="https://www.revenuecat.com/privacy">RevenueCat Privacy Policy</a></p></div>
<div class="tp-card"><h4>Firebase (FCM)</h4><p>FCM token, platform</p><p><a href="https://firebase.google.com/support/privacy">Firebase Privacy Policy</a></p></div>
<div class="tp-card"><h4>Sentry</h4><p>Error reports, device info</p><p><a href="https://sentry.io/privacy/">Sentry Privacy Policy</a></p></div>

<h2>5. Security</h2>
<ul>
<li>Passwords hashed with bcrypt (12 rounds)</li>
<li>JWT: access token 15 min, refresh token 30 days</li>
<li>Mobile tokens encrypted with Expo SecureStore</li>
<li>API communication over HTTPS</li>
</ul>

<h2>6. Your Rights (KVKK Article 11)</h2>
<ul class="rights-list">
<li>Learn whether your data is being processed</li>
<li>Learn the purpose of processing</li>
<li>Know third parties your data is transferred to</li>
<li>Request correction of incomplete or incorrect data</li>
<li>Request deletion under KVKK Article 7</li>
<li>Object to automated analysis results</li>
<li>Claim compensation for unlawful processing</li>
</ul>

<h2>7. Children</h2>
<p>Not intended for children under 13.</p>

<h2>8. Changes</h2>
<p>This policy may be updated. Significant changes communicated via in-app notification.</p>

<h2>9. Contact</h2>
<div class="contact-box"><p><strong>Developer:</strong> zafer77can</p><p><strong>Email:</strong> zafer.cankaya@gmail.com</p><p><strong>App:</strong> Kampanya Sepeti (com.kampanyasepeti.app)</p></div>
</div>
</div>
<div class="footer">&copy; 2026 Kampanya Sepeti</div>
<script>function switchLang(l){document.querySelectorAll('.lang-section').forEach(e=>e.classList.remove('active'));document.querySelectorAll('.lang-btn').forEach(e=>e.classList.remove('active'));document.getElementById('section-'+l).classList.add('active');document.getElementById('btn-'+l).classList.add('active')}</script>
</body></html>`;

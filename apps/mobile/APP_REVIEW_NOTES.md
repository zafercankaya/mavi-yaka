# Mavi Yaka — Apple App Review Notes

Bu dosya App Store Connect'e girilecek review notes içeriğidir.
ASC → App Information → App Review Information → Notes bölümüne kopyalanacak.

---

## Review Notes (English — ASC'ye girilecek metin)

```
=== 1. APP PURPOSE ===

Mavi Yaka is a blue-collar job listing aggregator serving 31 countries. The app collects publicly available job postings from employer career pages and job platforms, then presents them to users in a unified, searchable interface.

The app does NOT create job listings — it aggregates existing public listings from employer websites. Users browse jobs, follow companies, save favorites, and receive push notifications for new postings. All job applications redirect users to the original employer website/page.

Core value: Instead of visiting dozens of job sites individually, blue-collar workers find all relevant jobs in one app, filtered by sector, city, and company.

=== 2. HOW TO USE (USAGE INSTRUCTIONS) ===

Step 1: Open the app → Select your country from the market picker (31 countries available)
Step 2: Browse job listings on the Home tab — jobs are organized by sector and company
Step 3: Use filters (sector, city, company) to narrow results
Step 4: Tap any listing to see details → "Apply" button redirects to the original employer page
Step 5: Create a free account (email/password, Google Sign-In, or Apple Sign-In)
Step 6: Follow companies to get push notifications when they post new jobs
Step 7: Save/bookmark listings for later viewing in the Favorites tab
Step 8: (Optional) Upgrade to Premium for unlimited alerts and ad-free experience

No account is required to browse jobs. Account is needed only for: following companies, saving favorites, and receiving notifications.

=== 3. EXTERNAL SERVICES ===

The app uses the following third-party services:

• Sentry (sentry.io) — Error tracking and crash reporting. Collects anonymous error logs only.
• Firebase Cloud Messaging — Push notification delivery for job alerts.
• RevenueCat — In-app subscription management and receipt validation.
• Google AdMob — Display advertising (banner and interstitial ads for free tier users).
• Expo Push Notifications — Push notification infrastructure.
• Apple App Store / Google Play Store — Payment processing for Premium subscriptions.

Our backend API (maviyaka-api.duckdns.org) is a NestJS REST API that serves aggregated job data. It does not process payments directly — all payments go through Apple/Google.

=== 4. REGIONAL DIFFERENCES ===

The app serves 31 countries. Content differences by region:

• Each country has its own set of local employers and job listings (e.g., Turkey shows Turkish companies, USA shows American companies)
• The app is localized in 19 languages: Turkish, English, German, French, Spanish, Italian, Portuguese, Indonesian, Russian, Japanese, Thai, Arabic, Korean, Vietnamese, Polish, Malay, Dutch, Urdu, Swedish
• Language is auto-detected from device settings; users can change it manually
• Job sectors are the same across all countries (17 sectors: Logistics, Manufacturing, Retail, Construction, Food & Beverage, Automotive, Textile, Mining, Healthcare, Hospitality, Agriculture, Security, Facility Management, Metal & Steel, Chemicals, E-commerce & Delivery, Telecommunications)
• Subscription pricing varies by country/currency (18 currencies supported)
• Core functionality is identical across all regions — no features are region-locked

=== 5. SUBSCRIPTION DETAILS ===

The app offers an optional Premium subscription with two plans:
• Monthly Premium
• Yearly Premium (discounted)

Premium features:
• Unlimited company follows (free tier: limited)
• Unlimited daily push notifications (free tier: limited)
• Ad-free experience (no banner/interstitial ads)
• Advanced filters

All core features (browsing jobs, searching, viewing details, applying via redirect) are 100% free and always will be.

Subscriptions are managed via RevenueCat and processed through Apple's in-app purchase system. Auto-renewal, cancellation, and restore purchases are all handled per Apple's guidelines.

Privacy Policy: https://maviyaka-api.duckdns.org/privacy-policy
Terms of Service: Available in-app under Profile → Terms of Service

=== 6. REGULATORY COMPLIANCE ===

• KVKK (Turkish Personal Data Protection Law): Full compliance — privacy policy includes KVKK Article 11 rights disclosure
• GDPR-aligned: Data minimization, purpose limitation, user rights (access, deletion, portability)
• Data collected: Email (auth), display name (optional), device info (push tokens), followed companies, subscription status
• Data NOT collected: Location (not used), contacts, health data, financial data, browsing history
• Account deletion: Users can delete their account from Profile → Delete Account. All personal data is permanently deleted within 30 days.
• No user-generated content — the app only displays aggregated job listings from public sources
• Encryption: ITSAppUsesNonExemptEncryption = NO (uses only HTTPS/TLS for API communication)

=== 7. DEMO/TEST INFORMATION ===

No special demo account is needed. The app can be fully tested without an account:
1. Open the app
2. Select any country (e.g., "Turkey" or "United States")
3. Browse jobs, use filters, tap listings to see details

To test account features (follow, favorites, notifications):
• Create a new account using Apple Sign-In or email/password
• Email: test@maviyaka.app / Password: Test1234!
  (Pre-created test account — or create your own)

To test Premium subscription:
• Use a Sandbox Apple ID in TestFlight/Sandbox environment
• Subscription purchase flow works in sandbox mode via RevenueCat

Contact for review questions: zafer.cankaya@gmail.com
```

---

## Kısa Özet (Türkçe referans)

| # | Apple Maddesi | Mavi Yaka Karşılığı |
|---|--------------|---------------------|
| 1 | Uygulama amacı | İş ilanı toplayıcı — 31 ülke, 17 sektör, mavi yaka |
| 2 | Kullanım talimatları | 8 adımlı kullanım rehberi |
| 3 | Harici servis listesi | Sentry, Firebase, RevenueCat, AdMob, Expo Push |
| 4 | Bölgesel farklar | 31 ülke ayrı content, 19 dil, 18 para birimi |
| 5 | Düzenleyici belgeler | KVKK + GDPR-aligned, hesap silme, encryption |
| 6 | Demo/Test bilgisi | Hesapsız test edilebilir + test account |

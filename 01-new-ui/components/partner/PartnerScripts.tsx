import Script from "next/script";
import { ADSENSE_ENABLED, ANALYTICS_ENABLED, IZOOTO_ENABLED } from "@/lib/ads/gamConfig";

/*
 * PartnerScripts — centralized, independently ENV-GATED third-party tags. iZooto is enabled by default and
 * can be disabled with `NEXT_PUBLIC_IZOOTO_ENABLED=false`; AdSense and analytics remain disabled by default.
 *
 * ══ GAM IS NO LONGER LOADED HERE — LRG-ADS-CANARY-001 §2 ══
 *
 * `NEXT_PUBLIC_ADS_ENABLED` used to gate GAM *and* AdSense together, so there was no way to say "make Ad
 * Manager requests from twelve approved placements and load no AdSense at all" — which is precisely what the
 * canary is. The flag is gone; each system now has its own independent setting.
 *
 * GPT loads automatically from `components/ads/GamBootstrap.tsx` unless its explicit disable flag is set.
 * AdSense below is independently gated and must stay off for the canary, because a second ad system on the
 * same page would make every observed fill ambiguous about which system served it.
 *
 * IDs (from 03-docs/21, reference project): GAM network 21828142944; AdSense ca-pub-6009276896057794;
 * iZooto cdn.izooto.com/scripts/cfc658b260b3b771debdf9bae6aa7549d818e3b9.js; GA4 G-G3L83YMSN4;
 * GTM GTM-PC9TSRLZ. Legacy UA-58358715-1 is DOCUMENTED ONLY and intentionally NOT loaded (UA is sunset).
 *
 * iZooto renders unless its flag is explicitly `false`. The other scripts render only when explicitly enabled.
 */
const GA4_ID = "G-G3L83YMSN4";

export default function PartnerScripts() {
  return (
    <>
      {/* GAM/GPT is NOT here. See the header note and components/ads/GamBootstrap.tsx. */}
      {ADSENSE_ENABLED ? (
        <Script id="adsense-js" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6009276896057794" strategy="afterInteractive" crossOrigin="anonymous" />
      ) : null}

      {ANALYTICS_ENABLED ? (
        <>
          <Script id="ga4-js" src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_ID}');`}</Script>
          {/* GTM container GTM-PC9TSRLZ can be added here if GTM (rather than direct GA4) is chosen. */}
        </>
      ) : null}

      {IZOOTO_ENABLED ? (
        <Script id="izooto-js" src="https://cdn.izooto.com/scripts/cfc658b260b3b771debdf9bae6aa7549d818e3b9.js" strategy="lazyOnload" />
      ) : null}
    </>
  );
}

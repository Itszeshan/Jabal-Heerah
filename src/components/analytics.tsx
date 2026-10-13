import Script from "next/script";

function safeId(value: string | undefined) {
  if (!value) return "";
  return /^[A-Za-z0-9-]+$/.test(value) ? value : "";
}

export function Analytics() {
  const pixel = safeId(process.env.NEXT_PUBLIC_META_PIXEL_ID);
  const ga4 = safeId(process.env.NEXT_PUBLIC_GA4_ID);
  const gads = safeId(process.env.NEXT_PUBLIC_GADS_ID);
  const google = ga4 || gads;

  return (
    <>
      {pixel ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixel}');
            fbq('track', 'PageView');
          `}
        </Script>
      ) : null}
      {google ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${google}`} strategy="afterInteractive" />
          <Script id="google-tags" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${ga4 ? `gtag('config', '${ga4}');` : ""}
              ${gads ? `gtag('config', '${gads}');` : ""}
            `}
          </Script>
        </>
      ) : null}
    </>
  );
}

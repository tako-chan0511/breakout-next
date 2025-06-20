// src/pages/_document.tsx
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    const baseHref = process.env.NEXT_PUBLIC_BASE_PATH || "./";

    return (
      <Html lang="ja">
        <Head>
          {/* 既存のbaseタグ */}
          <base href={baseHref} />
          <link rel="manifest" href="/manifest.json" />

          {/* ★★★ ここからPWA用の設定を追加 ★★★ */}
          <meta name="application-name" content="breakout-next" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="breakout-next" />
          <meta
            name="description"
            content="ブロック崩しクラシックな論理ゲームです。"
          />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />

          {/* iOS用のアイコン */}
          <link rel="apple-touch-icon" href="/icon-192x192.png" />

          {/* manifest.jsonへのリンク */}
          <link rel="manifest" href="/manifest.json" />

          {/* テーマカラー */}
          <meta name="theme-color" content="#0ea5e9" />
          {/* ★★★ 追加ここまで ★★★ */}

          {/* 既存のテーマ切り替えスクリプト */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(() => {
                try {
                  const t = localStorage.getItem('theme');
                  if (t) document.documentElement.setAttribute('data-theme', t);
                } catch {}
              })();`,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

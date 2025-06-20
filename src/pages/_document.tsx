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
    // next.config.jsのbasePath設定が自動で反映されるため、ここでのパス操作は不要です。
    return (
      <Html lang="ja">
        <Head>
          {/* ★★★ ここからPWA用の設定を追加 ★★★ */}
          <meta name="application-name" content="breakout-next Game" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="breakout-next" />
          <meta name="description" content="ブロック崩し（Next.js版）です。" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          
          {/* iOS用のアイコン (パスはnext.config.jsに基づいて解決されます) */}
          <link rel="apple-touch-icon" href="/icon-192x192.png" />

          {/* manifest.jsonへのリンク (パスはnext.config.jsに基づいて解決されます) */}
          <link rel="manifest" href="/manifest.json" />

          {/* テーマカラー */}
          <meta name="theme-color" content="#0ea5e9" />
          {/* ★★★ 追加ここまで ★★★ */}
          
          {/* 既存のテーマ切り替えスクリプトなどがあれば、ここに維持します */}
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
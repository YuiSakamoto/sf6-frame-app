import Head from "expo-router/head";
import { Platform } from "react-native";
import { SITE_URL } from "@/config/site";

interface PageHeadProps {
  title: string;
  description: string;
  path?: string;
}

/**
 * Web向けSEOメタタグを設定するコンポーネント
 * ネイティブでは何もレンダリングしない
 */
export function PageHead({ title, description, path = "" }: PageHeadProps) {
  if (Platform.OS !== "web") return null;

  const url = `${SITE_URL}${path}`;
  const fullTitle = path ? `${title} | SF6 Frame Data` : title;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="SF6 Frame Data" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Head>
  );
}

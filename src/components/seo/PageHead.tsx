import Head from "expo-router/head";
import { Platform } from "react-native";
import { SITE_URL } from "@/config/site";

interface PageHeadProps {
  title: string;
  description: string;
  path?: string;
  /** OGP/Twitter 画像 (絶対 or ルート相対パス)。未指定時はデフォルトを使用 */
  image?: string;
}

const DEFAULT_OG_IMAGE = "/og-image.png";

export function PageHead({ title, description, path = "", image }: PageHeadProps) {
  if (Platform.OS !== "web") return null;

  const url = `${SITE_URL}${path}`;
  const fullTitle = path ? `${title} | SF6 Frame Data` : title;
  const imagePath = image ?? DEFAULT_OG_IMAGE;
  const imageUrl = imagePath.startsWith("http") ? imagePath : `${SITE_URL}${imagePath}`;

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
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Head>
  );
}

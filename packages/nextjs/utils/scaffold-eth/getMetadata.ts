import type { Metadata } from "next";
import { PORT, VERCEL_PROJECT_PRODUCTION_URL } from "~~/constants/EnvConsts";

const baseUrl = VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${VERCEL_PROJECT_PRODUCTION_URL}`
  : `http://localhost:${PORT || 3000}`;
const titleTemplate = "ChainHabits";

export const getMetadata = ({
  title,
  description,
  imageRelativePath = "/thumbnail.jpg",
}: {
  title: string;
  description: string;
  imageRelativePath?: string;
}): Metadata => {
  const imageUrl = `${baseUrl}${imageRelativePath}`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: titleTemplate,
    },
    description: description,
    openGraph: {
      title: {
        default: title,
        template: titleTemplate,
      },
      description: description,
      images: [
        {
          url: imageUrl,
        },
      ],
    },
    twitter: {
      title: {
        default: title,
        template: titleTemplate,
      },
      description: description,
      images: [imageUrl],
    },
    icons: {
      icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
    },
  };
};

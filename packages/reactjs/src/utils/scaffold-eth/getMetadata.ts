import { MetadataProps } from "~~/types/utils";

const getMetadata = ({ title, description, imageRelativePath = "/thumbnail.jpg" }: MetadataProps) => {
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
  const imageUrl = `${baseUrl}${imageRelativePath}`;

  return {
    title: `${title} | ChainHabits`,
    meta: [
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: imageUrl },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
    ],
    link: [{ rel: "icon", href: "/favicon.png", sizes: "32x32", type: "image/png" }],
  };
};

export { getMetadata };

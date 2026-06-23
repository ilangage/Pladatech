type CloudinaryImageOptions = {
  cloudName: string;
  width?: number;
};

const FALLBACK_CLOUD_NAME = "demo";
const FALLBACK_PUBLIC_ID = "sample";

export function getCloudinaryImageUrl(publicId: string, options: CloudinaryImageOptions) {
  const width = Math.max(1, Math.round(options.width ?? 600));
  const cloudName = options.cloudName.trim() || FALLBACK_CLOUD_NAME;
  const resolvedPublicId = options.cloudName.trim() ? publicId.trim() : FALLBACK_PUBLIC_ID;
  const safeCloudName = encodeURIComponent(cloudName);
  const safePublicId = resolvedPublicId
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `https://res.cloudinary.com/${safeCloudName}/image/upload/f_auto,q_auto,w_${width}/${safePublicId}`;
}

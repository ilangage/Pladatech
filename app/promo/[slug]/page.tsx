import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PromoProductOrderLanding from "@/components/promo/PromoProductOrderLanding";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";
import { loadWholesaleProducts } from "@/lib/wholesale-catalog";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const products = await loadWholesaleProducts();
  const product = products.find((item) => item.slug === slug && item.isActive);

  if (!product) {
    return {
      title: "Promo Product | Pladatech",
    };
  }

  return {
    title: `${product.title} | Pladatech Promo`,
    description: product.shortDescription ?? `Order ${product.title} from Pladatech with islandwide delivery support.`,
  };
}

export default async function PromoProductPage({ params }: Props) {
  const { slug } = await params;
  const products = await loadWholesaleProducts();
  const product = products.find((item) => item.slug === slug && item.isActive);

  if (!product) notFound();

  const cloudinaryCloudName =
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ??
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ??
    "";

  const imagePublicIds = [product.imagePublicId, ...(product.galleryPublicIds ?? [])].filter(Boolean);
  const imageUrls = imagePublicIds.length
    ? imagePublicIds.map((publicId) => getCloudinaryImageUrl(publicId, { cloudName: cloudinaryCloudName, width: 1000 }))
    : ["/wholesale/placeholder.svg"];

  return <PromoProductOrderLanding product={product} imageUrls={imageUrls} />;
}

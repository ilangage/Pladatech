import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopShell from "@/components/ShopShell";
import WholesaleProductDetailClient from "@/components/wholesale/WholesaleProductDetailClient";
import { getWholesaleCategoryLabel } from "@/data/wholesale-categories";
import { loadWholesaleProducts } from "@/lib/wholesale-catalog";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const products = await loadWholesaleProducts();
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return {
      title: "Wholesale Product | Pladatech",
    };
  }

  return {
    title: product.seoTitle ?? `${product.title} Wholesale | Pladatech`,
    description: product.seoDescription ?? product.shortDescription ?? `View wholesale pricing for ${product.title} at Pladatech.`,
  };
}

export default async function WholesaleProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const products = await loadWholesaleProducts();
  const product = products.find((item) => item.slug === slug && item.isActive);

  if (!product) notFound();

  const cloudinaryCloudName =
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ??
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ??
    "";

  const productTags = new Set(product.tags ?? []);
  const relatedProducts = products
    .filter((item) => item.isActive && item.slug !== product.slug)
    .sort((a, b) => {
      const score = (item: typeof a) =>
        (item.category === product.category ? 4 : 0) +
        (item.subcategory && item.subcategory === product.subcategory ? 3 : 0) +
        ((item.tags ?? []).some((tag) => productTags.has(tag)) ? 2 : 0) +
        (Math.abs((item.retailPrice ?? 0) - (product.retailPrice ?? 0)) < 1000 ? 1 : 0);
      return score(b) - score(a) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    })
    .slice(0, 3);

  const fallbackRelatedProducts = relatedProducts.length
    ? relatedProducts
    : products.filter((item) => item.isActive && item.slug !== product.slug).slice(0, 3);

  return (
    <ShopShell hideSocialRail>
      <WholesaleProductDetailClient
        product={product}
        relatedProducts={fallbackRelatedProducts}
        cloudinaryCloudName={cloudinaryCloudName}
        categoryLabel={getWholesaleCategoryLabel(product.category)}
      />
    </ShopShell>
  );
}

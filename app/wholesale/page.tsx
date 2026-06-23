import type { Metadata } from "next";
import ShopShell from "@/components/ShopShell";
import WholesaleProductsPage from "@/components/wholesale/WholesaleProductsPage";
import { loadWholesaleBanners } from "@/lib/wholesale-banners";
import { loadWholesaleProducts } from "@/lib/wholesale-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wholesale Products | Pladatech",
  description: "Browse Pladatech wholesale products for Sri Lankan resellers, retail buyers, and bulk buyers.",
};

export default async function WholesalePage() {
  const [products, banners] = await Promise.all([loadWholesaleProducts(), loadWholesaleBanners()]);
  const cloudinaryCloudName =
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ??
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ??
    "";

  return (
    <ShopShell hideSocialRail>
      <WholesaleProductsPage products={products} banners={banners} cloudinaryCloudName={cloudinaryCloudName} />
    </ShopShell>
  );
}

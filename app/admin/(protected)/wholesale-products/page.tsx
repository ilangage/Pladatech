import AdminWholesaleProductsClient from "@/components/admin/AdminWholesaleProductsClient";
import { getAdminWholesaleProducts } from "@/lib/admin-wholesale-products";

export const dynamic = "force-dynamic";

export default async function AdminWholesaleProductsPage() {
  const products = await getAdminWholesaleProducts();
  const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
  return <AdminWholesaleProductsClient initialProducts={products} cloudinaryCloudName={cloudinaryCloudName} />;
}

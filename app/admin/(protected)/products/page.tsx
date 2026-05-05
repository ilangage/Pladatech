import AdminProductsClient from "@/components/admin/AdminProductsClient";
import { bulkUpsertAdminProducts, getAdminProducts, mapProductToWritePayload } from "@/lib/admin-products";
import { products as fallbackProducts } from "@/data/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products = await getAdminProducts();
  if (products.length === 0) {
    try {
      await bulkUpsertAdminProducts(fallbackProducts.map(mapProductToWritePayload));
      products = await getAdminProducts();
    } catch {
      // Keep the page usable even if the seed step fails.
    }
  }
  return <AdminProductsClient initialProducts={products} />;
}

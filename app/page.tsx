import Storefront from "@/components/Storefront";
import { loadProducts } from "@/lib/product-catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await loadProducts();
  return <Storefront initialProducts={products} />;
}

import { notFound } from "next/navigation";
import AdminProductForm from "@/components/admin/AdminProductForm";
import { getAdminProducts } from "@/lib/admin-products";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const products = await getAdminProducts();
  const product = products.find((item) => item.id === id);
  if (!product) notFound();
  return <AdminProductForm mode="edit" initialProduct={product} saveLabel="Save changes" />;
}


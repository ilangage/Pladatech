import { notFound } from "next/navigation";
import AdminWholesaleBannerForm from "@/components/admin/AdminWholesaleBannerForm";
import { getAdminWholesaleBannerById } from "@/lib/admin-wholesale-banners";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function EditWholesaleBannerPage({ params }: Props) {
  const { id } = await params;
  const banner = await getAdminWholesaleBannerById(id);
  if (!banner) notFound();
  const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
  return <AdminWholesaleBannerForm mode="edit" banner={banner} cloudinaryCloudName={cloudinaryCloudName} />;
}

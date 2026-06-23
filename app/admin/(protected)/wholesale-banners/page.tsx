import AdminWholesaleBannersClient from "@/components/admin/AdminWholesaleBannersClient";
import { getAdminWholesaleBanners } from "@/lib/admin-wholesale-banners";

export const dynamic = "force-dynamic";

export default async function AdminWholesaleBannersPage() {
  const banners = await getAdminWholesaleBanners();
  const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
  return <AdminWholesaleBannersClient initialBanners={banners} cloudinaryCloudName={cloudinaryCloudName} />;
}

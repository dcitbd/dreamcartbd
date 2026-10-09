export async function renderHomePage() {
  // প্যারালাল লোডার: ৪টি রিকোয়েস্ট একসাথে মাত্র কয়েক মিলিসেকেন্ডে লোড হবে
  const [prodRes, catRes, brandRes, bannerRes] = await Promise.all([
    apiClient.request("products/list"),
    apiClient.request("categories/list"),
    apiClient.request("brands/list"),
    apiClient.request("banners/list")
  ]);

  const products = (prodRes.data && prodRes.data.items) || [];
  const categories = (catRes.data && catRes.data.items) || [];
  const brands = (brandRes.data && brandRes.data.items) || [];
  const banners = (bannerRes.data && bannerRes.data.items) || [];
  // ... বাকি কন্টেন্ট অপরিবর্তিত

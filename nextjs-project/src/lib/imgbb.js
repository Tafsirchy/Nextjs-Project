const IMGBB_API_KEY = "dfa80e89d351350c37179d4ea25bcd38";

export async function uploadToImgBB(file) {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      return { success: true, url: data.data.url };
    } else {
      return { success: false, message: data.error?.message || "Upload failed" };
    }
  } catch (error) {
    console.error("ImgBB upload error:", error);
    return { success: false, message: error.message };
  }
}

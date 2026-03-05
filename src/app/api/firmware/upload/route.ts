import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const version = formData.get("version") as string;
    const deviceType = formData.get("device_type") as string;
    const releaseNotes = formData.get("release_notes") as string | null;
    const isMandatory = formData.get("is_mandatory") === "true";

    if (!file || !version || !deviceType) {
      return NextResponse.json(
        { error: "Missing required fields: file, version, device_type" },
        { status: 400 }
      );
    }

    // Parse version string to version_code (Major*10000 + Minor*100 + Patch)
    const parts = version.split(".");
    if (parts.length !== 3 || parts.some((p) => isNaN(Number(p)))) {
      return NextResponse.json(
        { error: "Version must be in format X.Y.Z (e.g., 1.2.1)" },
        { status: 400 }
      );
    }
    const [major, minor, patch] = parts.map(Number);
    const versionCode = major * 10000 + minor * 100 + patch;

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileSize = buffer.length;

    // Compute SHA256 checksum
    const checksum = createHash("sha256").update(buffer).digest("hex");

    // Upload to Supabase Storage
    const fileName = `${deviceType}-v${version}.bin`;
    const supabase = await createClient();

    const { error: uploadError } = await supabase.storage
      .from("firmware")
      .upload(fileName, buffer, {
        contentType: "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Create firmware_versions record
    const { data, error: dbError } = await supabase
      .from("firmware_versions")
      .insert({
        version,
        version_code: versionCode,
        device_type: deviceType,
        firmware_url: `storage://firmware/${fileName}`,
        firmware_size: fileSize,
        firmware_checksum: checksum,
        release_notes: releaseNotes || null,
        rollout_percentage: 100,
        is_stable: true,
        is_mandatory: isMandatory,
        released_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      // Clean up uploaded file
      await supabase.storage.from("firmware").remove([fileName]);
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, firmware: data });
  } catch (error) {
    console.error("Firmware upload error:", error);
    return NextResponse.json(
      { error: `Upload failed: ${String(error)}` },
      { status: 500 }
    );
  }
}

import bcrypt from "bcrypt";
import Admin from "../models/admin.js";

export const createSuperAdminIfNotExists = async () => {
  try {
    if (!process.env.SA_EMAIL || !process.env.SA_PASSWORD) {
      throw new Error("Missing SA_EMAIL or SA_PASSWORD in environment variables");
    }

    const existingAdminHead = await Admin.findOne({
      where: { userType: "Admin", adminHead: true },
    });

    if (existingAdminHead) {
      if (process.env.NODE_ENV !== "production") {
        console.log("Admin Head already exists:", existingAdminHead.adminId);
      }
      return;
    }

    const lastAdmin = await Admin.findOne({ order: [["ID", "DESC"]] });
    const nextAdminNo = lastAdmin ? Number(lastAdmin.ID) + 1 : 1;
    const adminId = `ADMIN-${nextAdminNo.toString().padStart(5, "0")}-${Date.now()}`;

    const hashedPassword = await bcrypt.hash(process.env.SA_PASSWORD, 10);

    const adminHead = await Admin.create({
      adminId,
      userName: "Admin Head",
      emailAddress: process.env.SA_EMAIL,
      password: hashedPassword,
      userType: "Admin",
      verifiedUser: true,
      adminHead: true,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("Admin Head created:", adminHead.adminId);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      console.error("Error creating Admin Head");
    } else {
      console.error("[DEV ERROR] Admin Head creation failed:", error);
    }
  }
};
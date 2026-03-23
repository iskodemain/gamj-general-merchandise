import bcrypt from "bcrypt";
import Admin from "../models/admin.js";

export const createSuperAdminIfNotExists = async () => {
  try {
    if (!process.env.SA_EMAIL || !process.env.SA_PASSWORD) {
      throw new Error("Missing SA_EMAIL or SA_PASSWORD in environment variables");
    }

    const existingSuperAdmin = await Admin.findOne({
      where: { userType: "Super Admin" },
    });

    if (existingSuperAdmin) {
      if (process.env.NODE_ENV !== "production") {
        console.log("Super Admin already exists:", existingSuperAdmin.adminId);
      }
      return;
    }

    const lastAdmin = await Admin.findOne({ order: [["ID", "DESC"]] });
    const nextAdminNo = lastAdmin ? Number(lastAdmin.ID) + 1 : 1;
    const adminId = `ADMIN-${nextAdminNo.toString().padStart(5, "0")}-${Date.now()}`;

    const hashedPassword = await bcrypt.hash(process.env.SA_PASSWORD, 10);

    const superAdmin = await Admin.create({
      adminId,
      userName: "Super Admin",
      emailAddress: process.env.SA_EMAIL,
      password: hashedPassword,
      userType: "Super Admin",
      verifiedUser: true,
      adminHead: true,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("Super Admin created:", superAdmin.adminId);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      console.error("Error creating Super Admin");
    } else {
      console.error("[DEV ERROR] Super Admin creation failed:", error);
    }
  }
};
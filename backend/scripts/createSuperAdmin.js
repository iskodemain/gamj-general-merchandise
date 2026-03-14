import bcrypt from "bcrypt";
import Admin from "../models/admin.js";

export const createSuperAdminIfNotExists = async () => {
  try {
    const existingSuperAdmin = await Admin.findOne({
      where: { userType: "Super Admin" },
    });

    if (existingSuperAdmin) {
      console.log("Super Admin already exists:", existingSuperAdmin.adminId);
      return;
    }

    const lastAdmin = await Admin.findOne({ order: [["ID", "DESC"]] });
    const nextAdminNo = lastAdmin ? Number(lastAdmin.ID) + 1 : 1;
    const adminId = `ADMIN-${nextAdminNo.toString().padStart(5, "0")}-${Date.now()}`;

    const hashedPassword = await bcrypt.hash("superadmin123", 10);

    const superAdmin = await Admin.create({
      adminId,
      userName: "Super Admin",
      emailAddress: "gamjmerchandisehelp@gmail.com",
      password: hashedPassword,
      userType: "Super Admin",
      verifiedUser: true,
      adminHead: true,
    });

    console.log("Super Admin created:", superAdmin.adminId);
  } catch (error) {
    console.error("Error creating Super Admin:", error);
  }
};
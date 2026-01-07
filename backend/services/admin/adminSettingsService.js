import {v2 as cloudinary} from 'cloudinary';
import SystemSettings from "../../models/systemSettings.js"
import Admin from "../../models/admin.js";
import fs from 'fs/promises';

// ID GENERATOR
const withTimestamp = (prefix, number) => {
  return `${prefix}-${number.toString().padStart(5, "0")}-${Date.now()}`;
};

export const fetchSettingsDataService = async () => {
    try {
        const settingData = await SystemSettings.findAll({});
        if (settingData.length === 0) {
            return {
                success: true,
                settingData: [],
            };
        }

        return {
            success: true,
            settingData,
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}


export const updateSettingsDataService = async (adminId, body, files) => {
  try {
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return {
        success: false,
        message: "User not found",
      };
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
      const lastSettings = await SystemSettings.findOne({
        order: [["ID", "DESC"]],
      });

      const nextSettingsNo = lastSettings ? Number(lastSettings.ID) + 1 : 1;

      const systemSettingsId = withTimestamp("SETTINGS", nextSettingsNo);

      settings = await SystemSettings.create({
        systemSettingsId,
        businessName: body.businessName || "Default Business Name",
      });
    }


    let updatedData = {};
    const uploadsToDelete = []; 

    if (body.businessName) {
      updatedData.businessName = body.businessName;
    }

    if (files.businessLogo && files.businessLogo[0]) {
      const file = files.businessLogo[0];

      const uploaded = await cloudinary.uploader.upload(file.path, {
        folder: "gamj/systemSettings",
        resource_type: "image",
      });

      updatedData.businessLogo = uploaded.secure_url;

      uploadsToDelete.push(file.path);
    }


    if (files.homeCoverImage && files.homeCoverImage[0]) {
      const file = files.homeCoverImage[0];

      const uploaded = await cloudinary.uploader.upload(file.path, {
        folder: "gamj/systemSettings",
        resource_type: "image",
      });

      updatedData.homeCoverImage = uploaded.secure_url;

      uploadsToDelete.push(file.path);
    }

    await settings.update(updatedData);

    try {
      for (const path of uploadsToDelete) {
        await fs.unlink(path);
      }
    } catch (unlinkErr) {
      console.error("Failed to delete temp files:", unlinkErr.message);
    }

    return {
      success: true,
      message: "Settings updated successfully!",
      updated: updatedData,
    };

  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};
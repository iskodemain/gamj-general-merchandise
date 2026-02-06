import Provinces from "../../models/provinces.js";
import Cities from "../../models/cities.js";
import Barangays from "../../models/barangays.js";
import Admin from "../../models/admin.js";

const withTimestamp = (prefix, number) => {
  return `${prefix}-${number.toString().padStart(5, "0")}-${Date.now()}`;
};

// PROVINCES SERVICES
export const fetchProvincesService = async (adminID) => {
    try {
        const adminUser = await Admin.findByPk(adminID);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        const provinces = await Provinces.findAll({});
        if (!provinces.length) {
            return {
                success: true,
                provinces: []
            }
        }

        return {
            success: true,
            provinces
        }
        
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const addProvinceService = async (adminID, provinceName) => {
  try {
    // Validate Admin Exists
    const adminUser = await Admin.findByPk(adminID);
    if (!adminUser) {
      return { success: false, message: "Admin user not found" };
    }

    // Validate province name
    if (!provinceName || !provinceName.trim()) {
      return { success: false, message: "Province name is required" };
    }

    const cleanName = provinceName.trim();

    // Auto-generate provinceId
    const lastProvince = await Provinces.findOne({
      order: [["ID", "DESC"]],
    });

    const nextNumber = lastProvince ? lastProvince.ID + 1 : 1;
    const provinceId = withTimestamp("PROV", nextNumber);

    // Create Province Record
    const created = await Provinces.create({
      provinceId,
      provinceName: cleanName,
      createdBy: adminID,
    });

    return {
      success: true,
      data: created,
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};


export const updateProvinceService = async (adminID, provinceID, provinceName) => {
  try {
    // Validate Admin Exists
    const adminUser = await Admin.findByPk(adminID);
    if (!adminUser) {
      return { success: false, message: "Admin user not found" };
    }

    const province = await Provinces.findByPk(provinceID);
    if (!province) {
      return { success: false, message: "Province not found" };
    }

    province.provinceName = provinceName.trim();
    await province.save();
    return { 
      success: true, 
      data: province 
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};


export const deleteProvinceService = async (adminID, provinceID) => {
  try {
    // Validate Admin Exists
    const adminUser = await Admin.findByPk(adminID);
    if (!adminUser) {
      return { success: false, message: "Admin user not found" };
    }

    const province = await Provinces.findByPk(provinceID);
    if (!province) {
      return { success: false, message: "Province not found" };
    }

    await province.destroy();

    return { 
      success: true, 
      data: province 
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};


// CITIES SERVICES
export const fetchCitiesService = async (adminID) => {
    try {
        const adminUser = await Admin.findByPk(adminID);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        const cities = await Cities.findAll({});
        if (!cities.length) {
            return {
                success: true,
                cities: []
            }
        }

        return {
            success: true,
            cities
        }
        
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}


// BARANGAY SERVICES
export const fetchBarangaysService = async (adminID) => {
    try {
        const adminUser = await Admin.findByPk(adminID);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        const barangays = await Barangays.findAll({});
        if (!barangays.length) {
            return {
                success: true,
                barangays: []
            }
        }

        return {
            success: true,
            barangays
        }
        
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}
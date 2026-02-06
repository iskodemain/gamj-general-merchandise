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

export const addCitiesService = async (adminID, cityName, provinceId) => {
  try {
    // Validate Admin Exists
    const adminUser = await Admin.findByPk(adminID);
    if (!adminUser) {
      return { success: false, message: "Admin user not found" };
    }

    // Validate province name
    if (!cityName || !cityName.trim()) {
      return { success: false, message: "City name is required" };
    }

    const province = await Provinces.findByPk(provinceId);
    if (!province) {
      return { success: false, message: "Province not found" };
    }

    const cleanName = cityName.trim();

    // Auto-generate cityId
    const lastCity = await Cities.findOne({
      order: [["ID", "DESC"]],
    });

    const nextNumber = lastCity ? lastCity.ID + 1 : 1;
    const cityId = withTimestamp("CITY", nextNumber);

    // Create City Record
    const created = await Cities.create({
      cityId,
      cityName: cleanName,
      provinceId
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


export const updateCitiesService = async (adminID, cityID, cityName, provinceId) => {
  try {
    // Validate Admin Exists
    const adminUser = await Admin.findByPk(adminID);
    if (!adminUser) {
      return { success: false, message: "Admin user not found" };
    }

    const province = await Provinces.findByPk(provinceId);
    if (!province) {
      return { success: false, message: "Province not found" };
    }

    const city = await Cities.findByPk(cityID);
    if (!city) {
      return { success: false, message: "City not found" };
    }

    city.cityName = cityName.trim();
    city.provinceId = provinceId;
    await city.save();
    return { 
      success: true, 
      data: city 
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};


export const deleteCitiesService = async (adminID, cityID) => {
  try {
    // Validate Admin Exists
    const adminUser = await Admin.findByPk(adminID);
    if (!adminUser) {
      return { success: false, message: "Admin user not found" };
    }

    const city = await Cities.findByPk(cityID);
    if (!city) {
      return { success: false, message: "City not found" };
    }

    await city.destroy();

    return { 
      success: true, 
      data: city 
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};


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

export const addBarangaysService = async (adminID, barangayName, cityId, provinceId) => {
  try {
    // Validate Admin Exists
    const adminUser = await Admin.findByPk(adminID);
    if (!adminUser) {
      return { success: false, message: "Admin user not found" };
    }

    // Validate province name
    if (!barangayName || !barangayName.trim()) {
      return { success: false, message: "Barangay name is required" };
    }

    const city = await Cities.findByPk(cityId);
    if (!city) {
      return { success: false, message: "City not found" };
    }

    const province = await Provinces.findByPk(provinceId);
    if (!province) {
      return { success: false, message: "Province not found" };
    }

    const cleanName = barangayName.trim();

    // Auto-generate barangayId
    const lastBarangay = await Barangays.findOne({
      order: [["ID", "DESC"]],
    });

    const nextNumber = lastBarangay ? lastBarangay.ID + 1 : 1;
    const barangayId = withTimestamp("BRGY", nextNumber);

    // Create Barangay Record
    const created = await Barangays.create({
      barangayId,
      barangayName: cleanName,
      provinceId,
      cityId
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


export const updateBarangaysService = async (adminID, barangayID, barangayName, cityId, provinceId) => {
  try {
    // Validate Admin Exists
    const adminUser = await Admin.findByPk(adminID);
    if (!adminUser) {
      return { success: false, message: "Admin user not found" };
    }

    const barangay = await Barangays.findByPk(barangayID);
    if (!barangay) {
      return { success: false, message: "Barangay not found" };
    }

    const city = await Cities.findByPk(cityId);
    if (!city) {
      return { success: false, message: "City not found" };
    }

    const province = await Provinces.findByPk(provinceId);
    if (!province) {
      return { success: false, message: "Province not found" };
    }

    barangay.barangayName = barangayName.trim();
    barangay.provinceId = provinceId;
    barangay.cityId = cityId;
    await barangay.save();
    return { 
      success: true, 
      data: barangay 
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};


export const deleteBarangaysService = async (adminID, barangayID) => {
  try {
    // Validate Admin Exists
    const adminUser = await Admin.findByPk(adminID);
    if (!adminUser) {
      return { success: false, message: "Admin user not found" };
    }

    const barangay = await Barangays.findByPk(barangayID);
    if (!barangay) {
      return { success: false, message: "Barangay not found" };
    }

    await barangay.destroy();

    return { 
      success: true, 
      data: barangay 
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};
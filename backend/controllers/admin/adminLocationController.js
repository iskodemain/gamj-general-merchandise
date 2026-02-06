import { addProvinceService, updateProvinceService, deleteProvinceService, fetchProvincesService, fetchCitiesService, fetchBarangaysService, addCitiesService, updateCitiesService, deleteCitiesService } from "../../services/admin/adminLocationService.js";

export const fetchProvinces = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchProvincesService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const addProvince = async (req, res) => {
    try {
        const { ID } = req.admin;
        const { provinceName } = req.body;
        
        const result = await addProvinceService(ID, provinceName);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const updateProvince = async (req, res) => {
    try {
        const { ID } = req.admin;
        const { provinceID, provinceName } = req.body;
        
        const result = await updateProvinceService(ID, provinceID, provinceName);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const deleteProvince = async (req, res) => {
    try {
        const { ID } = req.admin;
        const { provinceID } = req.body;
        
        const result = await deleteProvinceService(ID, provinceID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const fetchCities = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchCitiesService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const addCities = async (req, res) => {
    try {
        const { ID } = req.admin;
        const { cityName, provinceId } = req.body;
        
        const result = await addCitiesService(ID, cityName, provinceId);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const updateCities = async (req, res) => {
    try {
        const { ID } = req.admin;
        const { cityID, cityName, provinceId } = req.body;
        
        const result = await updateCitiesService(ID, cityID, cityName, provinceId);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const deleteCities = async (req, res) => {
    try {
        const { ID } = req.admin;
        const { cityID } = req.body;
        
        const result = await deleteCitiesService(ID, cityID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const fetchBarangays = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchBarangaysService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

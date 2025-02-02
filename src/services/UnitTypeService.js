import axios from 'axios';

const API_URL = 'http://localhost:3000/api/unit'; // Adjust port if needed

export const getAllUnitTypes = async () => {
  try {
    const response = await axios.get(`${API_URL}/get-all`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createUnitType = async (unitData) => {
  try {
    const response = await axios.post(`${API_URL}/create`, {
      MaDVTinh: unitData.id,
      TenDVTinh: unitData.name
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Có lỗi xảy ra' };
  }
};

export const updateUnitType = async (id, unitData) => {
  try {
    const response = await axios.put(`${API_URL}/update/${id}`, {
      MaDVTinh: unitData.id,
      TenDVTinh: unitData.name
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Có lỗi xảy ra khi cập nhật đơn vị tính' };
  }
};

export const getUnitById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/get-by-id/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUnitType = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

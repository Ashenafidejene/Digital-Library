import { apiService, ApiResponse } from './api';

// Define the shape of the settings object
export interface AdminSettings {
  // Add specific settings properties here, e.g.:
  // siteName: string;
  // maintenanceMode: boolean;
  [key: string]: any; 
}

/**
 * Fetches the current admin settings.
 * @returns {Promise<ApiResponse<AdminSettings>>} A promise that resolves to the admin settings.
 */
export const getAdminSettings = async (): Promise<ApiResponse<AdminSettings>> => {
  return apiService.get('/admin/settings');
};

/**
 * Updates the admin settings.
 * @param {Partial<AdminSettings>} settings - The settings to update.
 * @returns {Promise<ApiResponse<AdminSettings>>} A promise that resolves to the updated settings.
 */
export const updateAdminSettings = async (settings: Partial<AdminSettings>): Promise<ApiResponse<AdminSettings>> => {
  return apiService.put('/admin/settings', settings);
};

import axios from 'axios';

const API_URL = 'api/rest/trees/';

export const fetchTrees = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching tree data:', error);
    throw error;
  }
};

export const fetchTreeDetails = async (tagNumber) => {
  try {
    const response = await axios.get(`${API_URL}${tagNumber}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tree details for tag ${tagNumber}:`, error);
    throw error;
  }
};

export const filterTrees = (trees, filters) => {
  if (!trees || !trees.features) return [];
  
  return trees.features.filter(tree => {
    const properties = tree.properties;
    
    // Filter by common name if specified
    if (filters.common_name && !properties.common_name.toLowerCase().includes(filters.common_name.toLowerCase())) {
      return false;
    }
    
    // Filter by tag number if specified
    if (filters.tag_number && !String(properties.tag_number).includes(filters.tag_number)) {
      return false;
    }
    
    // Filter by height range if specified
    if ((filters.height_min || filters.height_max) && properties.height) {
      // Extract numeric value from height property (assuming format like "30 ft")
      const heightValue = parseFloat(properties.height);
      
      if (!isNaN(heightValue)) {
        if (filters.height_min && heightValue < parseFloat(filters.height_min)) {
          return false;
        }
        
        if (filters.height_max && heightValue > parseFloat(filters.height_max)) {
          return false;
        }
      }
    }
    
    return true;
  });
}; 
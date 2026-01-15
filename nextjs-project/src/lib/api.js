export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Fetch all bikes
export async function fetchBikes(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.featured) params.append('featured', 'true');
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = `${API_URL}/api/bikes${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      cache: 'no-store' // Always get fresh data
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching bikes:', error);
    throw error;
  }
}

// Fetch single bike by ID
export async function fetchBikeById(id) {
  try {
    const response = await fetch(`${API_URL}/api/bikes/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching bike:', error);
    throw error;
  }
}

// Create new bike
export async function createBike(bikeData, userEmail) {
  try {
    const response = await fetch(`${API_URL}/api/bikes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userEmail}`,
      },
      body: JSON.stringify(bikeData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating bike:', error);
    throw error;
  }
}

// Update bike
export async function updateBike(id, bikeData, userEmail) {
  try {
    const response = await fetch(`${API_URL}/api/bikes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userEmail}`,
      },
      body: JSON.stringify(bikeData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating bike:', error);
    throw error;
  }
}

// Delete bike
export async function deleteBike(id, userEmail) {
  try {
    const response = await fetch(`${API_URL}/api/bikes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userEmail}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting bike:', error);
    throw error;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
async function fetchAuthenticated(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers: { ...headers, ...options.headers } });
    
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        throw new Error('Sitzung ungültig.');
    }
    return response;
}

export const apiService = {
    getReferrals: () => fetchAuthenticated('/referrals'),
    createReferral: (data) => fetchAuthenticated('/referrals', { method: 'POST', body: JSON.stringify(data) }),
    updateReferralStatus: (id, status) => fetchAuthenticated(`/referrals/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    deleteReferral: (id) => fetchAuthenticated(`/referrals/${id}`, { method: 'DELETE' }),
    getReferralPdf: (id) => fetchAuthenticated(`/referrals/${id}/pdf`)
};
import axios from 'axios';
import { initialTreaties, initialClaims, initialCedents, initialCatEvents, initialAnalytics } from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT token if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('genre_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for local mock fallbacks if backend is unreachable
const inMemoryStore = {
  treaties: [...initialTreaties],
  claims: [...initialClaims],
  cedents: [...initialCedents],
  catEvents: [...initialCatEvents],
  analytics: { ...initialAnalytics },
};

// API Service Functions
export const api = {
  // Auth
  login: async (credentials) => {
    try {
      const response = await client.post('/api/v1/auth/login', credentials);
      if (response.data?.token) {
        localStorage.setItem('genre_auth_token', response.data.token);
      }
      return response.data;
    } catch {
      // Offline fallback
      if (credentials.email === 'test@example.com' || credentials.email === 'admin@example.com') {
        const dummyToken = 'mock-jwt-token-genre-2026';
        localStorage.setItem('genre_auth_token', dummyToken);
        return {
          token: dummyToken,
          user: {
            id: 'usr-1',
            email: credentials.email,
            name: credentials.email.includes('admin') ? 'Senior Underwriter (Admin)' : 'Reinsurance Underwriter',
            role: credentials.email.includes('admin') ? 'ADMIN' : 'UNDERWRITER',
          },
        };
      }
      throw new Error('Invalid email or password');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await client.get('/api/v1/auth/me');
      return response.data;
    } catch {
      return {
        id: 'usr-1',
        email: 'test@example.com',
        name: 'Reinsurance Underwriter',
        role: 'UNDERWRITER',
      };
    }
  },

  // Analytics & Dashboard Summary
  getAnalyticsSummary: async () => {
    try {
      const res = await client.get('/api/v1/analytics/summary');
      return res.data;
    } catch {
      return inMemoryStore.analytics;
    }
  },

  // Treaties & Facultative Policies
  getTreaties: async (filters = {}) => {
    try {
      const res = await client.get('/api/v1/treaties', { params: filters });
      return res.data;
    } catch {
      let filtered = [...inMemoryStore.treaties];
      if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter((t) => t.status === filters.status);
      }
      if (filters.lineOfBusiness && filters.lineOfBusiness !== 'ALL') {
        filtered = filtered.filter((t) => t.lineOfBusiness === filters.lineOfBusiness);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter((t) =>
          t.treatyName.toLowerCase().includes(q) ||
          t.treatyCode.toLowerCase().includes(q) ||
          t.cedentName.toLowerCase().includes(q)
        );
      }
      return filtered;
    }
  },

  getTreatyById: async (id) => {
    try {
      const res = await client.get(`/api/v1/treaties/${id}`);
      return res.data;
    } catch {
      const found = inMemoryStore.treaties.find((t) => t.id === id);
      if (!found) throw new Error('Treaty not found');
      return found;
    }
  },

  createTreaty: async (treatyData) => {
    try {
      const res = await client.post('/api/v1/treaties', treatyData);
      return res.data;
    } catch {
      const newTreaty = {
        id: `trt-${Date.now()}`,
        treatyCode: `TRT-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...treatyData,
      };
      inMemoryStore.treaties.unshift(newTreaty);
      return newTreaty;
    }
  },

  updateTreatyStatus: async (id, status, notes = '') => {
    try {
      const res = await client.patch(`/api/v1/treaties/${id}/status`, { status, notes });
      return res.data;
    } catch {
      const idx = inMemoryStore.treaties.findIndex((t) => t.id === id);
      if (idx !== -1) {
        inMemoryStore.treaties[idx] = {
          ...inMemoryStore.treaties[idx],
          status,
          underwriterNotes: notes || inMemoryStore.treaties[idx].underwriterNotes,
          updatedAt: new Date().toISOString(),
        };
        return inMemoryStore.treaties[idx];
      }
      throw new Error('Treaty not found');
    }
  },

  // Claims
  getClaims: async (filters = {}) => {
    try {
      const res = await client.get('/api/v1/claims', { params: filters });
      return res.data;
    } catch {
      let filtered = [...inMemoryStore.claims];
      if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter((c) => c.status === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter((c) =>
          c.claimNumber.toLowerCase().includes(q) ||
          c.cedentName.toLowerCase().includes(q) ||
          c.eventDescription.toLowerCase().includes(q)
        );
      }
      return filtered;
    }
  },

  createClaim: async (claimData) => {
    try {
      const res = await client.post('/api/v1/claims', claimData);
      return res.data;
    } catch {
      const newClaim = {
        id: `clm-${Date.now()}`,
        claimNumber: `CLM-${Math.floor(10000 + Math.random() * 90000)}`,
        reportedDate: new Date().toISOString().split('T')[0],
        ...claimData,
      };
      inMemoryStore.claims.unshift(newClaim);
      return newClaim;
    }
  },

  updateClaimStatus: async (id, status, notes = '') => {
    try {
      const res = await client.patch(`/api/v1/claims/${id}/status`, { status, notes });
      return res.data;
    } catch {
      const idx = inMemoryStore.claims.findIndex((c) => c.id === id);
      if (idx !== -1) {
        inMemoryStore.claims[idx] = {
          ...inMemoryStore.claims[idx],
          status,
          adjusterNotes: notes || inMemoryStore.claims[idx].adjusterNotes,
        };
        return inMemoryStore.claims[idx];
      }
      throw new Error('Claim not found');
    }
  },

  // Cedents
  getCedents: async () => {
    try {
      const res = await client.get('/api/v1/cedents');
      return res.data;
    } catch {
      return inMemoryStore.cedents;
    }
  },

  // CAT Exposure
  getCatEvents: async () => {
    try {
      const res = await client.get('/api/v1/cat-events');
      return res.data;
    } catch {
      return inMemoryStore.catEvents;
    }
  },

  // Risk Pricing Calculation
  calculatePricing: async (payload) => {
    try {
      const res = await client.post('/api/v1/pricing/calculate', payload);
      return res.data;
    } catch {
      // Local mathematical actuarial calculation
      const { limit = 10000000, attachmentPoint = 2000000, expectedLossRate = 0.035, expenseLoadRatio = 0.12, profitMargin = 0.08, catRiskLoad = 0.04 } = payload;
      const layerCapacity = limit - attachmentPoint > 0 ? limit - attachmentPoint : limit;
      const expectedLoss = layerCapacity * (parseFloat(expectedLossRate) || 0.035);
      const purePremium = expectedLoss;
      const riskLoad = purePremium * (parseFloat(catRiskLoad) || 0.04);
      const expenseLoad = purePremium * (parseFloat(expenseLoadRatio) || 0.12);
      const targetMargin = purePremium * (parseFloat(profitMargin) || 0.08);
      const technicalPremium = purePremium + riskLoad + expenseLoad + targetMargin;
      const rateOnLine = (technicalPremium / layerCapacity) * 100;
      const estimatedCombinedRatio = ((purePremium + expenseLoad) / technicalPremium) * 100;

      return {
        layerCapacity,
        expectedLoss,
        purePremium,
        riskLoad,
        expenseLoad,
        targetMargin,
        technicalPremium,
        rateOnLine: parseFloat(rateOnLine.toFixed(2)),
        estimatedCombinedRatio: parseFloat(estimatedCombinedRatio.toFixed(2)),
        pml100Year: purePremium * 2.8,
        pml250Year: purePremium * 4.2,
      };
    }
  },
};

export default client;

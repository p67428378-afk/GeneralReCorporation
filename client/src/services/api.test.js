import { describe, it, expect } from 'vitest';
import { api } from './api';

describe('API Services', () => {
  it('should export all essential API functions', () => {
    expect(typeof api.login).toBe('function');
    expect(typeof api.getCurrentUser).toBe('function');
    expect(typeof api.getAnalyticsSummary).toBe('function');
    expect(typeof api.getTreaties).toBe('function');
    expect(typeof api.getTreatyById).toBe('function');
    expect(typeof api.createTreaty).toBe('function');
    expect(typeof api.updateTreatyStatus).toBe('function');
    expect(typeof api.getClaims).toBe('function');
    expect(typeof api.createClaim).toBe('function');
    expect(typeof api.updateClaimStatus).toBe('function');
    expect(typeof api.getCedents).toBe('function');
    expect(typeof api.getCatEvents).toBe('function');
    expect(typeof api.calculatePricing).toBe('function');
  });

  it('should calculate risk pricing accurately via calculatePricing', async () => {
    const result = await api.calculatePricing({
      limit: 50000000,
      attachmentPoint: 10000000,
      expectedLossRate: 0.04,
      expenseLoadRatio: 0.10,
      profitMargin: 0.05,
      catRiskLoad: 0.05,
    });

    expect(result).toBeDefined();
    expect(result.layerCapacity).toBe(40000000);
    expect(result.purePremium).toBeGreaterThan(0);
    expect(result.technicalPremium).toBeGreaterThan(result.purePremium);
    expect(result.rateOnLine).toBeGreaterThan(0);
  });

  it('should return mock treaties when getTreaties is called', async () => {
    const treaties = await api.getTreaties();
    expect(Array.isArray(treaties)).toBe(true);
    expect(treaties.length).toBeGreaterThan(0);
  });
});

// Mock IA provider for development and testing

export const mockIAProvider = {
  generateInsights: async (data) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      insights: [
        "Revenue is trending upward (+12% vs last quarter)",
        "Top performing segment: Enterprise accounts",
        "Opportunity: Focus on Q4 pipeline acceleration"
      ],
      confidence: 0.85,
      timestamp: new Date().toISOString()
    };
  },

  analyzePerformance: async (metrics) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      performance: {
        score: 78,
        trends: {
          revenue: "increasing",
          efficiency: "stable",
          satisfaction: "improving"
        }
      },
      recommendations: [
        "Increase focus on high-value accounts",
        "Optimize pricing strategy for mid-market",
        "Enhance customer onboarding process"
      ]
    };
  },

  predictForecast: async (historicalData) => {
    await new Promise(resolve => setTimeout(resolve, 1200));

    return {
      forecast: {
        nextQuarter: {
          revenue: "$2.4M",
          confidence: 0.82
        },
        nextYear: {
          revenue: "$9.8M",
          confidence: 0.74
        }
      },
      factors: [
        "Seasonal trends",
        "Market expansion",
        "Product launches"
      ]
    };
  }
};

export default mockIAProvider;
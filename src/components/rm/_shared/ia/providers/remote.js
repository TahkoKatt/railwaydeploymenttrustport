// Remote IA provider for production API calls

const API_BASE_URL = process.env.VITE_IA_API_URL || 'https://api.trustport.ai';

export const remoteIAProvider = {
  generateInsights: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_IA_API_KEY || ''}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`IA API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to generate insights:', error);
      // Fallback to mock data
      return {
        insights: ["API temporarily unavailable - showing cached insights"],
        confidence: 0.0,
        timestamp: new Date().toISOString(),
        error: true
      };
    }
  },

  analyzePerformance: async (metrics) => {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_IA_API_KEY || ''}`
        },
        body: JSON.stringify(metrics)
      });

      if (!response.ok) {
        throw new Error(`IA API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to analyze performance:', error);
      return {
        performance: { score: 0, trends: {} },
        recommendations: ["API temporarily unavailable"],
        error: true
      };
    }
  },

  predictForecast: async (historicalData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_IA_API_KEY || ''}`
        },
        body: JSON.stringify(historicalData)
      });

      if (!response.ok) {
        throw new Error(`IA API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to predict forecast:', error);
      return {
        forecast: {
          nextQuarter: { revenue: "N/A", confidence: 0 },
          nextYear: { revenue: "N/A", confidence: 0 }
        },
        factors: ["API temporarily unavailable"],
        error: true
      };
    }
  }
};

export default remoteIAProvider;
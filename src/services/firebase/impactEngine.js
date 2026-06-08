export const ImpactEngine = {
  // ---------------------------------------------------------------------------
  // 1. GLOBAL IMPACT SCORE CALCULATION
  // ---------------------------------------------------------------------------
  calculateGlobalImpactScore(userMetrics) {
    /* 
      Calculates a global impact score (0-10,000) based on:
      - Educational Impact (courses created, mentoring)
      - Research Impact (papers published, citations)
      - Innovation Impact (prototypes built)
      - Community Impact (events hosted, governance votes)
      - Startup Impact (venture valuation, jobs created)
    */
    
    const weights = {
      education: 1.5,
      research: 2.0,
      innovation: 1.8,
      community: 1.0,
      startup: 2.5
    };

    let score = 0;
    score += (userMetrics.education || 0) * weights.education;
    score += (userMetrics.research || 0) * weights.research;
    score += (userMetrics.innovation || 0) * weights.innovation;
    score += (userMetrics.community || 0) * weights.community;
    score += (userMetrics.startup || 0) * weights.startup;

    return Math.min(Math.round(score), 10000); // Cap at 10k
  },

  // ---------------------------------------------------------------------------
  // 2. GENERATE ECOSYSTEM RANKINGS
  // ---------------------------------------------------------------------------
  generateGlobalRankings(entities, category) {
    // Sort entities based on their pre-calculated impact score
    const sorted = [...entities].sort((a, b) => b.impactScore - a.impactScore);
    
    // Assign ranks
    return sorted.map((entity, index) => ({
      ...entity,
      globalRank: index + 1,
      rankingCategory: category
    }));
  }
};

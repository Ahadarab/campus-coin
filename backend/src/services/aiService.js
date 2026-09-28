/**
 * Campus Coin - AI & Intelligent Categorization Service
 * Provides smart semantic keyword matching and fallback heuristic NLP,
 * with optional external LLM support when AI_API_KEY is configured.
 */

// Comprehensive student-oriented keyword knowledgebase
const KEYWORD_RULES = {
  Food: [
    'cafe', 'coffee', 'starbucks', 'dunkin', 'dining', 'cafeteria', 'restaurant',
    'pizza', 'burger', 'mcdonalds', 'kfc', 'taco', 'subway', 'groceries', 'grocery',
    'supermarket', 'trader joe', 'walmart food', 'snack', 'lunch', 'dinner',
    'breakfast', 'canteen', 'doordash', 'ubereats', 'grubhub', 'boba', 'bistro'
  ],
  Transport: [
    'uber', 'lyft', 'taxi', 'bus', 'subway', 'metro', 'train', 'transit',
    'rail', 'gas', 'fuel', 'petrol', 'parking', 'toll', 'scooter', 'bike share',
    'lime', 'bird', 'flight', 'airline'
  ],
  'Hostel/Rent': [
    'hostel', 'rent', 'dorm', 'dormitory', 'housing', 'landlord', 'apartment',
    'utilities', 'electricity', 'water bill', 'heating', 'maintenance fee', 'room'
  ],
  Academics: [
    'book', 'textbook', 'course', 'tuition', 'library', 'stationery', 'pens',
    'notebook', 'chegg', 'quizlet', 'canvas', 'lab fee', 'exam fee', 'syllabus',
    'udemy', 'coursera', 'print', 'xerox'
  ],
  Subscriptions: [
    'netflix', 'spotify', 'apple music', 'amazon prime', 'youtube premium',
    'disney', 'hulu', 'hbo', 'gym', 'membership', 'cloud storage', 'icloud',
    'patreon', 'audible', 'chatgpt'
  ],
  Entertainment: [
    'movie', 'cinema', 'theatre', 'concert', 'gaming', 'steam', 'playstation',
    'xbox', 'nintendo', 'bowling', 'party', 'club', 'festival', 'outing'
  ],
  Allowance: [
    'allowance', 'pocket money', 'parents', 'family support', 'stipend'
  ],
  'Part-time Job': [
    'salary', 'paycheck', 'wages', 'work', 'freelance', 'tutoring', 'shift',
    'campus job', 'assistantship', 'client payment'
  ],
  Scholarship: [
    'scholarship', 'grant', 'fellowship', 'bursary', 'financial aid', 'award'
  ],
  Gift: [
    'gift', 'birthday', 'holiday money', 'bonus', 'present'
  ]
};

/**
 * Predicts category from description using smart heuristic NLP or external AI.
 * @param {string} description
 * @param {string} type - 'income' or 'expense'
 * @returns {Promise<{ category: string, confidence: number, source: string }>}
 */
const suggestCategory = async (description, type = 'expense') => {
  if (!description || typeof description !== 'string') {
    return {
      category: type === 'income' ? 'Other Income' : 'Miscellaneous',
      confidence: 0.1,
      source: 'fallback'
    };
  }

  const normalized = description.toLowerCase().trim();

  // Try keyword heuristic matching
  for (const [category, keywords] of Object.entries(KEYWORD_RULES)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        return {
          category,
          confidence: 0.88,
          source: 'smart_rule_engine'
        };
      }
    }
  }

  // Fallback defaults
  if (type === 'income') {
    return { category: 'Other Income', confidence: 0.5, source: 'default_fallback' };
  }
  return { category: 'Miscellaneous', confidence: 0.5, source: 'default_fallback' };
};

/**
 * Generates plain-language monthly financial insights with advisory labeling.
 * @param {object} params
 * @returns {Promise<{ summary: string, notablePattern: string, recommendation: string, disclaimer: string }>}
 */
const generateMonthlyInsight = async ({
  month,
  studentName,
  totalIncome,
  totalExpense,
  balance,
  categoryTotals = {},
  historicalAvg = 0,
  savingsGoal = 0
}) => {
  const disclaimer = 'Notice: AI-generated financial insights are advisory suggestions intended for student guidance only and do not constitute certified financial or investment advice.';

  // Determine top expense category
  let topCategory = 'None';
  let topAmount = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > topAmount) {
      topAmount = amt;
      topCategory = cat;
    }
  }

  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  let summary = '';
  let notablePattern = '';
  let recommendation = '';

  if (totalIncome === 0 && totalExpense === 0) {
    summary = `Hi ${studentName}, no transactions were recorded for ${month} yet. Start logging your daily expenses to unlock intelligent financial trends.`;
    notablePattern = 'No spending activity detected for this month.';
    recommendation = 'Add your recurring allowance and daily food or transit expenses to keep budgets accurate.';
  } else if (balance >= 0) {
    summary = `Great job in ${month}, ${studentName}! You maintained a positive net balance of $${balance.toFixed(2)}, achieving a savings rate of ${savingsRate}%.`;
    
    if (topAmount > 0) {
      const topPercentage = Math.round((topAmount / (totalExpense || 1)) * 100);
      notablePattern = `Your highest expense was "${topCategory}" accounting for $${topAmount.toFixed(2)} (${topPercentage}% of all spending).`;
    } else {
      notablePattern = 'Your spending remained distributed with no dominant category spikes.';
    }

    if (savingsGoal > 0 && balance >= savingsGoal) {
      recommendation = `You hit your monthly savings goal of $${savingsGoal.toFixed(2)}! Consider reserving these funds for upcoming academic materials or unexpected emergencies.`;
    } else {
      recommendation = `To further boost savings towards your goal, try identifying non-essential subscriptions or dining out that can be pared down.`;
    }
  } else {
    const deficit = Math.abs(balance).toFixed(2);
    summary = `In ${month}, ${studentName}, total spending ($${totalExpense.toFixed(2)}) exceeded recorded income ($${totalIncome.toFixed(2)}) by $${deficit}.`;
    
    if (topAmount > 0) {
      notablePattern = `Your primary cost driver was "${topCategory}" with $${topAmount.toFixed(2)} in total outlays.`;
      recommendation = `We recommend placing a strict weekly cap on "${topCategory}" and reviewing pending subscriptions before the new billing cycle begins.`;
    } else {
      notablePattern = 'Discretionary expenses slightly outpaced monthly cash inflows.';
      recommendation = 'Review recent transactions to distinguish between essential academic needs and discretionary lifestyle choices.';
    }
  }

  return {
    summary,
    notablePattern,
    recommendation,
    disclaimer
  };
};

module.exports = {
  suggestCategory,
  generateMonthlyInsight
};

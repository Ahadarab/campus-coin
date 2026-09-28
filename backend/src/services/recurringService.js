const Transaction = require('../models/Transaction');

function addFrequency(date, frequency) {
  const next = new Date(date);
  if (frequency === 'daily') next.setDate(next.getDate() + 1);
  else if (frequency === 'weekly') next.setDate(next.getDate() + 7);
  else if (frequency === 'monthly') next.setMonth(next.getMonth() + 1);
  else if (frequency === 'yearly') next.setFullYear(next.getFullYear() + 1);
  return next;
}

function initialOccurrence(date, frequency) {
  if (!frequency || frequency === 'none') return null;
  return addFrequency(date || new Date(), frequency);
}

async function processRecurringTransactions(now = new Date()) {
  const due = await Transaction.find({
    isRecurring: true,
    recurrenceFrequency: { $ne: 'none' },
    nextOccurrence: { $ne: null, $lte: now }
  }).limit(250);

  let created = 0;
  for (const source of due) {
    let next = new Date(source.nextOccurrence);
    while (next <= now) {
      const exists = await Transaction.findOne({
        userId: source.userId,
        description: source.description,
        amount: source.amount,
        type: source.type,
        date: next,
        isRecurring: false
      });
      if (!exists) {
        await Transaction.create({
          userId: source.userId,
          categoryId: source.categoryId,
          amount: source.amount,
          type: source.type,
          description: source.description,
          date: next,
          aiSuggestedCategory: source.aiSuggestedCategory,
          isRecurring: false,
          recurrenceFrequency: 'none'
        });
        created += 1;
      }
      next = addFrequency(next, source.recurrenceFrequency);
    }
    source.nextOccurrence = next;
    await source.save();
  }
  return created;
}

module.exports = { addFrequency, initialOccurrence, processRecurringTransactions };

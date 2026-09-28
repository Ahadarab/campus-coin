const mongoose = require('../backend/node_modules/mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const User = require('../backend/src/models/User');
const Category = require('../backend/src/models/Category');
const Transaction = require('../backend/src/models/Transaction');
const Budget = require('../backend/src/models/Budget');
const Tip = require('../backend/src/models/Tip');
const Announcement = require('../backend/src/models/Announcement');
const Notification = require('../backend/src/models/Notification');
const Insight = require('../backend/src/models/Insight');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_coin?directConnection=true';
    await mongoose.connect(mongoUri);
    console.log(`[Database Seeder] Connected to ${mongoUri}`);

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Transaction.deleteMany({}),
      Budget.deleteMany({}),
      Tip.deleteMany({}),
      Announcement.deleteMany({}),
      Notification.deleteMany({}),
      Insight.deleteMany({})
    ]);
    console.log('[Database Seeder] Existing database collections cleared.');

    // 1. Create Default Categories
    const defaultIncomeCategories = [
      { name: 'Allowance', type: 'income', color: '#10B981', icon: 'wallet' },
      { name: 'Part-time Job', type: 'income', color: '#059669', icon: 'briefcase' },
      { name: 'Scholarship', type: 'income', color: '#34D399', icon: 'award' },
      { name: 'Gift', type: 'income', color: '#6EE7B7', icon: 'gift' },
      { name: 'Other Income', type: 'income', color: '#14B8A6', icon: 'plus-circle' }
    ];

    const defaultExpenseCategories = [
      { name: 'Food', type: 'expense', color: '#EF4444', icon: 'utensils' },
      { name: 'Transport', type: 'expense', color: '#F97316', icon: 'car' },
      { name: 'Hostel/Rent', type: 'expense', color: '#8B5CF6', icon: 'home' },
      { name: 'Academics', type: 'expense', color: '#3B82F6', icon: 'book' },
      { name: 'Subscriptions', type: 'expense', color: '#EC4899', icon: 'film' },
      { name: 'Entertainment', type: 'expense', color: '#F59E0B', icon: 'smile' },
      { name: 'Miscellaneous', type: 'expense', color: '#6B7280', icon: 'tag' }
    ];

    const allDefaultCats = [...defaultIncomeCategories, ...defaultExpenseCategories].map((cat) => ({
      ...cat,
      isDefault: true,
      userId: null
    }));

    const createdCategories = await Category.insertMany(allDefaultCats);
    console.log(`[Database Seeder] Seeded ${createdCategories.length} default categories.`);

    const catLookup = {};
    createdCategories.forEach((c) => {
      catLookup[c.name] = c._id;
    });

    // 2. Create Demo Student and Demo Admin
    const demoStudent = await User.create({
      name: 'Demo Student',
      email: 'student@example.com',
      password: 'ChangeMe123!',
      academicYear: '1st Year',
      monthlyAllowanceBaseline: 300,
      monthlySavingsGoal: 50,
      currency: '$',
      role: 'student',
      status: 'active'
    });

    const demoAdmin = await User.create({
      name: 'System Administrator',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin',
      status: 'active'
    });

    console.log(`[Database Seeder] Created Demo Student (${demoStudent.email}) and Demo Admin (${demoAdmin.email}).`);

    // 3. Seed Realistic Transactions across Past 3 Months
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 15);
    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const twoMonthsAgoDate = new Date(currentYear, currentMonth - 2, 15);

    const sampleTransactions = [
      // Current Month Transactions
      {
        userId: demoStudent._id,
        categoryId: catLookup['Allowance'],
        amount: 300,
        type: 'income',
        description: 'Monthly allowance from parents',
        date: new Date(currentYear, currentMonth, 1),
        isRecurring: true,
        recurrenceFrequency: 'monthly'
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Part-time Job'],
        amount: 150,
        type: 'income',
        description: 'Library desk assistant wages',
        date: new Date(currentYear, currentMonth, 12),
        isRecurring: false
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Hostel/Rent'],
        amount: 120,
        type: 'expense',
        description: 'Hostel room monthly rent fee',
        date: new Date(currentYear, currentMonth, 2),
        isRecurring: true,
        recurrenceFrequency: 'monthly'
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Food'],
        amount: 80,
        type: 'expense',
        description: 'Food expenses & campus cafeteria meal plan',
        date: new Date(currentYear, currentMonth, 5)
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Transport'],
        amount: 30,
        type: 'expense',
        description: 'Transport expenses (monthly metro pass reload)',
        date: new Date(currentYear, currentMonth, 7)
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Academics'],
        amount: 40,
        type: 'expense',
        description: 'Books and stationery (Calculus textbook & notes)',
        date: new Date(currentYear, currentMonth, 9)
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Entertainment'],
        amount: 30,
        type: 'expense',
        description: 'Entertainment & cinema with dormitory friends',
        date: new Date(currentYear, currentMonth, 14)
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Subscriptions'],
        amount: 12.99,
        type: 'expense',
        description: 'Spotify Student + Netflix shared sub',
        date: new Date(currentYear, currentMonth, 16),
        isRecurring: true,
        recurrenceFrequency: 'monthly'
      },
      // Previous Month Transactions
      {
        userId: demoStudent._id,
        categoryId: catLookup['Allowance'],
        amount: 300,
        type: 'income',
        description: 'Previous month allowance',
        date: new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1)
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Part-time Job'],
        amount: 120,
        type: 'income',
        description: 'Campus tutoring stipend',
        date: new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 15)
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Hostel/Rent'],
        amount: 120,
        type: 'expense',
        description: 'Hostel rent payment',
        date: new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 2)
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Food'],
        amount: 95,
        type: 'expense',
        description: 'Grocery store & takeout',
        date: new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 10)
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Transport'],
        amount: 28,
        type: 'expense',
        description: 'Campus shuttle and bus fare',
        date: new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 8)
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Academics'],
        amount: 55,
        type: 'expense',
        description: 'Lab notebook and printing credits',
        date: new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 18)
      },
      // Two Months Ago Transactions
      {
        userId: demoStudent._id,
        categoryId: catLookup['Allowance'],
        amount: 300,
        type: 'income',
        description: 'Allowance from family',
        date: new Date(twoMonthsAgoDate.getFullYear(), twoMonthsAgoDate.getMonth(), 1)
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Hostel/Rent'],
        amount: 120,
        type: 'expense',
        description: 'Hostel fee',
        date: new Date(twoMonthsAgoDate.getFullYear(), twoMonthsAgoDate.getMonth(), 2)
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Food'],
        amount: 75,
        type: 'expense',
        description: 'Groceries and dining hall',
        date: new Date(twoMonthsAgoDate.getFullYear(), twoMonthsAgoDate.getMonth(), 14)
      }
    ];

    await Transaction.insertMany(sampleTransactions);
    console.log(`[Database Seeder] Seeded ${sampleTransactions.length} realistic historical transactions.`);

    // 4. Seed Monthly Budgets for Demo Student
    const sampleBudgets = [
      {
        userId: demoStudent._id,
        categoryId: catLookup['Food'],
        month: currentMonthStr,
        limitAmount: 100 // $80 spent -> 80% (triggers near-limit warning!)
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Transport'],
        month: currentMonthStr,
        limitAmount: 40 // $30 spent -> 75%
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Hostel/Rent'],
        month: currentMonthStr,
        limitAmount: 130 // $120 spent -> 92% (triggers near-limit warning!)
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Academics'],
        month: currentMonthStr,
        limitAmount: 60 // $40 spent -> 66%
      },
      {
        userId: demoStudent._id,
        categoryId: catLookup['Entertainment'],
        month: currentMonthStr,
        limitAmount: 35 // $30 spent -> 85% (triggers near-limit warning!)
      }
    ];

    await Budget.insertMany(sampleBudgets);
    console.log(`[Database Seeder] Seeded ${sampleBudgets.length} category budgets for ${currentMonthStr}.`);

    // 5. Seed System-Wide Saving Tip Templates
    const tipTemplates = [
      {
        title: 'Student Transit Concession Passes',
        description: 'Most university transit authorities offer semester-long unlimited bus and metro passes at up to 50% discount.',
        categoryName: 'Transport',
        priority: 'high',
        source: 'system',
        userId: null,
        savingsImpact: 35
      },
      {
        title: 'Used Textbooks & Course Reserves',
        description: 'Check the university library reserve desk for digital copies or buy second-hand course materials from senior students.',
        categoryName: 'Academics',
        priority: 'high',
        source: 'system',
        userId: null,
        savingsImpact: 50
      },
      {
        title: 'Shared Streaming & Student Bundles',
        description: 'Spotify, Apple Music and Amazon Prime offer 50% off verified student pricing with .edu email addresses.',
        categoryName: 'Subscriptions',
        priority: 'medium',
        source: 'system',
        userId: null,
        savingsImpact: 15
      },
      {
        title: 'Meal Prep Over Daily Campus Takeout',
        description: 'Preparing batch dinners or packing dorm lunches twice a week can save over $70 per month compared to cafe dining.',
        categoryName: 'Food',
        priority: 'high',
        source: 'system',
        userId: null,
        savingsImpact: 70
      }
    ];

    await Tip.insertMany(tipTemplates);
    console.log(`[Database Seeder] Seeded ${tipTemplates.length} system saving tip templates.`);

    // 6. Seed System Announcements
    const announcements = [
      {
        title: 'Campus Financial Literacy Week',
        message: 'Join the annual Campus Finance Workshop this Wednesday at 4 PM in Student Hall B. Learn about tax credits, student credit cards, and micro-investing.',
        priority: 'info',
        createdBy: demoAdmin._id
      },
      {
        title: 'Fall Semester Scholarship Application Window',
        message: 'Undergraduate bursary and merit grant applications are now open on the financial aid portal. Deadline is October 15.',
        priority: 'warning',
        createdBy: demoAdmin._id
      }
    ];

    await Announcement.insertMany(announcements);
    console.log(`[Database Seeder] Seeded ${announcements.length} system announcements.`);

    // 7. Seed Initial Notifications for Demo Student
    const notifications = [
      {
        userId: demoStudent._id,
        type: 'budget_approaching',
        title: '⚠️ Budget Warning: Food',
        message: 'You have spent 80% ($80.00 of $100.00) of your Food budget for this month.',
        link: '/budgets',
        read: false
      },
      {
        userId: demoStudent._id,
        type: 'system_announcement',
        title: '📢 Campus Financial Literacy Week',
        message: 'Join the annual Campus Finance Workshop this Wednesday at 4 PM in Student Hall B.',
        link: '/dashboard',
        read: false
      }
    ];

    await Notification.insertMany(notifications);
    console.log(`[Database Seeder] Seeded ${notifications.length} notifications.`);

    // 8. Seed Sample Monthly Insight
    await Insight.create({
      userId: demoStudent._id,
      month: currentMonthStr,
      summaryText: `Hi Demo Student! In ${currentMonthStr}, you maintained healthy financial control with an active surplus of $187.01 and a 42% net savings rate.`,
      notablePattern: 'Hostel rent and food formed 71% of your overall monthly outlays, while transit and subscriptions remained lean.',
      tipText: 'Your food spending reached 80% of budget. Consider packing dorm lunches for the remaining days of the month to protect your savings goal.',
      generatedAt: new Date()
    });
    console.log('[Database Seeder] Seeded initial monthly AI insight.');

    console.log('------------------------------------------------------------');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Demo Student Login: student@example.com / ChangeMe123!');
    console.log('Demo Admin Login:   admin@gmail.com   / admin123');
    console.log('------------------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Database Seeder Error]:', error);
    process.exit(1);
  }
};

seedData();

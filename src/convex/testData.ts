import { mutation } from "./_generated/server";
import { EXPENSE_CATEGORIES } from "./schema";

export const seedTestData = mutation({
  args: {},
  handler: async (ctx) => {
    // Create test users
    const user1Id = await ctx.db.insert("users", {
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "user",
    });

    const user2Id = await ctx.db.insert("users", {
      name: "Bob Smith", 
      email: "bob@example.com",
      role: "user",
    });

    const user3Id = await ctx.db.insert("users", {
      name: "Carol Davis",
      email: "carol@example.com", 
      role: "user",
    });

    // Create test group
    const groupId = await ctx.db.insert("groups", {
      name: "Apartment 4B",
      description: "Shared expenses for our apartment",
      createdBy: user1Id,
      inviteCode: "APT4B2",
      currency: "USD",
    });

    // Add members to group
    await ctx.db.insert("groupMembers", {
      groupId,
      userId: user1Id,
      joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      isActive: true,
    });

    await ctx.db.insert("groupMembers", {
      groupId,
      userId: user2Id,
      joinedAt: Date.now() - 25 * 24 * 60 * 60 * 1000, // 25 days ago
      isActive: true,
    });

    await ctx.db.insert("groupMembers", {
      groupId,
      userId: user3Id,
      joinedAt: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 days ago
      isActive: true,
    });

    // Create test expenses
    const expenses = [
      {
        title: "Grocery Shopping",
        description: "Weekly groceries from Whole Foods",
        amount: 156.78,
        category: EXPENSE_CATEGORIES.GROCERIES,
        paidBy: user1Id,
        date: Date.now() - 5 * 24 * 60 * 60 * 1000,
      },
      {
        title: "Electricity Bill",
        description: "Monthly electricity bill",
        amount: 89.45,
        category: EXPENSE_CATEGORIES.UTILITIES,
        paidBy: user2Id,
        date: Date.now() - 10 * 24 * 60 * 60 * 1000,
      },
      {
        title: "Internet Bill",
        description: "Monthly internet service",
        amount: 65.00,
        category: EXPENSE_CATEGORIES.UTILITIES,
        paidBy: user3Id,
        date: Date.now() - 15 * 24 * 60 * 60 * 1000,
      },
      {
        title: "Dinner at Italian Place",
        description: "Group dinner celebration",
        amount: 124.50,
        category: EXPENSE_CATEGORIES.DINING,
        paidBy: user1Id,
        date: Date.now() - 7 * 24 * 60 * 60 * 1000,
      },
    ];

    for (const expense of expenses) {
      const expenseId = await ctx.db.insert("expenses", {
        groupId,
        ...expense,
        isSettled: false,
      });

      // Create equal splits for all members
      const splitAmount = Math.round((expense.amount / 3) * 100) / 100;
      const members = [user1Id, user2Id, user3Id];

      for (let i = 0; i < members.length; i++) {
        const amount = i === members.length - 1 
          ? expense.amount - (splitAmount * (members.length - 1)) // Adjust last split for rounding
          : splitAmount;

        await ctx.db.insert("expenseSplits", {
          expenseId,
          userId: members[i],
          amount,
          isPaid: members[i] === expense.paidBy,
        });
      }
    }

    return { groupId, users: [user1Id, user2Id, user3Id] };
  },
});

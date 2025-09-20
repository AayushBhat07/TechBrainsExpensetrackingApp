import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Expense categories
export const EXPENSE_CATEGORIES = {
  GROCERIES: "groceries",
  UTILITIES: "utilities",
  RENT: "rent",
  DINING: "dining",
  TRANSPORTATION: "transportation",
  ENTERTAINMENT: "entertainment",
  HOUSEHOLD: "household",
  HEALTHCARE: "healthcare",
  OTHER: "other",
} as const;

export const categoryValidator = v.union(
  v.literal(EXPENSE_CATEGORIES.GROCERIES),
  v.literal(EXPENSE_CATEGORIES.UTILITIES),
  v.literal(EXPENSE_CATEGORIES.RENT),
  v.literal(EXPENSE_CATEGORIES.DINING),
  v.literal(EXPENSE_CATEGORIES.TRANSPORTATION),
  v.literal(EXPENSE_CATEGORIES.ENTERTAINMENT),
  v.literal(EXPENSE_CATEGORIES.HOUSEHOLD),
  v.literal(EXPENSE_CATEGORIES.HEALTHCARE),
  v.literal(EXPENSE_CATEGORIES.OTHER),
);

export type ExpenseCategory = Infer<typeof categoryValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Groups for shared expenses (households, roommates, etc.)
    groups: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      createdBy: v.id("users"),
      inviteCode: v.string(),
      currency: v.optional(v.string()), // USD, EUR, etc.
    }).index("by_invite_code", ["inviteCode"])
      .index("by_creator", ["createdBy"]),

    // Group memberships
    groupMembers: defineTable({
      groupId: v.id("groups"),
      userId: v.id("users"),
      joinedAt: v.number(),
      isActive: v.boolean(),
    }).index("by_group", ["groupId"])
      .index("by_user", ["userId"])
      .index("by_group_and_user", ["groupId", "userId"]),

    // Expenses
    expenses: defineTable({
      groupId: v.id("groups"),
      title: v.string(),
      description: v.optional(v.string()),
      amount: v.number(),
      category: categoryValidator,
      paidBy: v.id("users"),
      receiptUrl: v.optional(v.id("_storage")),
      date: v.number(),
      isSettled: v.boolean(),
    }).index("by_group", ["groupId"])
      .index("by_payer", ["paidBy"])
      .index("by_group_and_date", ["groupId", "date"])
      .index("by_category", ["category"]),

    // Expense splits (who owes what for each expense)
    expenseSplits: defineTable({
      expenseId: v.id("expenses"),
      userId: v.id("users"),
      amount: v.number(),
      isPaid: v.boolean(),
    }).index("by_expense", ["expenseId"])
      .index("by_user", ["userId"])
      .index("by_expense_and_user", ["expenseId", "userId"]),

    // Payments/settlements between users
    payments: defineTable({
      groupId: v.id("groups"),
      fromUserId: v.id("users"),
      toUserId: v.id("users"),
      amount: v.number(),
      description: v.optional(v.string()),
      date: v.number(),
      relatedExpenses: v.optional(v.array(v.id("expenses"))),
    }).index("by_group", ["groupId"])
      .index("by_from_user", ["fromUserId"])
      .index("by_to_user", ["toUserId"])
      .index("by_group_and_date", ["groupId", "date"]),

    // Budget goals
    budgets: defineTable({
      groupId: v.id("groups"),
      category: categoryValidator,
      monthlyLimit: v.number(),
      month: v.string(), // YYYY-MM format
      createdBy: v.id("users"),
    }).index("by_group", ["groupId"])
      .index("by_group_and_month", ["groupId", "month"])
      .index("by_group_category_month", ["groupId", "category", "month"]),

    // Payment reminders
    reminders: defineTable({
      groupId: v.id("groups"),
      fromUserId: v.id("users"),
      toUserId: v.id("users"),
      amount: v.number(),
      message: v.optional(v.string()),
      isRead: v.boolean(),
      relatedExpenses: v.optional(v.array(v.id("expenses"))),
    }).index("by_group", ["groupId"])
      .index("by_to_user", ["toUserId"])
      .index("by_from_user", ["fromUserId"]),

    // Add: userProfiles table for onboarding and personalization
    userProfiles: defineTable({
      userId: v.id("users"),
      financialGoal: v.optional(v.string()),
      spendingPersonality: v.optional(v.string()),
      motivationType: v.optional(v.string()),
      monthlyIncome: v.optional(v.string()),
      spendingConfidence: v.optional(v.number()),
      problemCategories: v.optional(v.array(v.string())),
      collaborationType: v.optional(v.string()),
      preferredCategories: v.optional(v.array(v.string())),
      bankConnected: v.optional(v.boolean()),
      autoAlerts: v.optional(v.boolean()),
      // Optional detailed fields
      emergencyMonths: v.optional(v.number()),
      majorPurchaseAmount: v.optional(v.number()),
      majorPurchaseTimeline: v.optional(v.string()),
      debtAmount: v.optional(v.number()),
      debtType: v.optional(v.string()),
      typicalSpending: v.optional(v.number()),
      essentialsPct: v.optional(v.number()),
      // Add: persisted onboarding progress for resuming
      onboardingStep: v.optional(v.number()),
      onboardingQStep: v.optional(v.number()),
      onboardingCompleted: v.optional(v.boolean()),
      completedAt: v.optional(v.number()),
    }).index("by_user", ["userId"]),

    // Add: AI-generated insights per user
    userInsights: defineTable({
      userId: v.id("users"),
      // raw text returned by the LLM (stringified JSON or narrative text)
      content: v.string(),
      // optional structured JSON string (clients can parse)
      structured: v.optional(v.string()),
      // prompt metadata (for auditability)
      promptKind: v.optional(v.string()),
      model: v.optional(v.string()),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
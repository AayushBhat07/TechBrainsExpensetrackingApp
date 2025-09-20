import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Create a new group
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to create a group");
    }

    // Generate a unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      description: args.description,
      createdBy: user._id,
      inviteCode,
      currency: args.currency || "USD",
    });

    // Add creator as first member
    await ctx.db.insert("groupMembers", {
      groupId,
      userId: user._id,
      joinedAt: Date.now(),
      isActive: true,
    });

    return groupId;
  },
});

// Join a group by invite code
export const joinByInviteCode = mutation({
  args: {
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to join a group");
    }

    const group = await ctx.db
      .query("groups")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();

    if (!group) {
      throw new Error("Invalid invite code");
    }

    // Check if user is already a member
    const existingMember = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => 
        q.eq("groupId", group._id).eq("userId", user._id)
      )
      .unique();

    if (existingMember) {
      if (existingMember.isActive) {
        throw new Error("You are already a member of this group");
      } else {
        // Reactivate membership
        await ctx.db.patch(existingMember._id, { isActive: true });
        return group._id;
      }
    }

    // Add user to group
    await ctx.db.insert("groupMembers", {
      groupId: group._id,
      userId: user._id,
      joinedAt: Date.now(),
      isActive: true,
    });

    return group._id;
  },
});

// Get user's groups
export const getUserGroups = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        if (!group) return null;

        // Get member count
        const memberCount = await ctx.db
          .query("groupMembers")
          .withIndex("by_group", (q) => q.eq("groupId", group._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        return {
          ...group,
          memberCount: memberCount.length,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return groups.filter(Boolean);
  },
});

// Get group details with members
export const getGroupDetails = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    // Check if user is a member
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this group");
    }

    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Get all active members
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const memberUser = await ctx.db.get(membership.userId);
        return {
          ...memberUser,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return {
      ...group,
      members: members.filter(Boolean),
    };
  },
});

// Leave a group
export const leaveGroup = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => 
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this group");
    }

    await ctx.db.patch(membership._id, { isActive: false });
  },
});

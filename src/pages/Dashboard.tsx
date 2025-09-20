import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Plus, Users, Receipt, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import CreateGroupDialog from "@/components/CreateGroupDialog";
import JoinGroupDialog from "@/components/JoinGroupDialog";
import type { Id } from "@/convex/_generated/dataModel";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);

  // Shape of group item returned by backend (non-null)
  type GroupListItem = {
    _id: Id<"groups">;
    _creationTime: number;
    name: string;
    description?: string;
    currency?: string;
    createdBy: Id<"users">;
    inviteCode: string;
    memberCount: number;
    joinedAt: number;
  };

  const groupsRaw = useQuery(api.groups.getUserGroups);
  // Ensure non-null list of groups with correct typings
  const validGroups: GroupListItem[] = (groupsRaw ?? []).filter(
    (g): g is GroupListItem => Boolean(g)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Filter out null groups (computed above)
  // const validGroups = groups?.filter(Boolean) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Welcome back, {user.name || "User"}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your shared expenses and track balances
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowJoinGroup(true)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Join Group
              </Button>
              <Button
                onClick={() => setShowCreateGroup(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {validGroups.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No groups yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your first group to start tracking shared expenses with roommates, 
              family, or friends.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setShowJoinGroup(true)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Join Existing Group
              </Button>
              <Button
                onClick={() => setShowCreateGroup(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Group
              </Button>
            </div>
          </motion.div>
        ) : (
          // Groups Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {validGroups.map((group, index) => (
              <motion.div
                key={group._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200"
                  onClick={() => navigate(`/group/${group._id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-gray-900">
                        {group.name}
                      </CardTitle>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                    {group.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {group.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                      </div>
                      <div className="text-gray-500">
                        {group.currency || 'USD'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {validGroups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Groups</p>
                      <p className="text-2xl font-bold text-gray-900">{validGroups.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                      <Receipt className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Since</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Date(Math.min(...validGroups.map(g => g.joinedAt))).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                      <TrendingUp className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Members Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {validGroups.reduce((sum, group) => sum + group.memberCount, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>

      {/* Dialogs */}
      <CreateGroupDialog 
        open={showCreateGroup} 
        onOpenChange={setShowCreateGroup}
      />
      <JoinGroupDialog 
        open={showJoinGroup} 
        onOpenChange={setShowJoinGroup}
      />
    </motion.div>
  );
}
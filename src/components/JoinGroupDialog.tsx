import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function JoinGroupDialog({ open, onOpenChange }: JoinGroupDialogProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const joinGroup = useMutation(api.groups.joinByInviteCode);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsLoading(true);
    try {
      const groupId = await joinGroup({
        inviteCode: inviteCode.trim().toUpperCase(),
      });

      toast("Successfully joined the group!");
      onOpenChange(false);
      setInviteCode("");
      navigate(`/group/${groupId}`);
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message);
      } else {
        toast("Failed to join group. Please check the invite code.");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Join Group</DialogTitle>
          <DialogDescription>
            Enter the invite code shared by a group member to join their expense group.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="inviteCode" className="text-sm font-medium">
              Invite Code *
            </Label>
            <Input
              id="inviteCode"
              placeholder="e.g., APT4B2"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
              className="border-gray-200 font-mono text-center text-lg tracking-wider"
              maxLength={8}
            />
            <p className="text-xs text-gray-500">
              Invite codes are usually 6-8 characters long
            </p>
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!inviteCode.trim() || isLoading}
              className="bg-gray-900 hover:bg-gray-800"
            >
              {isLoading ? "Joining..." : "Join Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

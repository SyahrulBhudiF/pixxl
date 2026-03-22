import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface NewCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: { name: string; command: string; description?: string }) => void;
}

export function NewCommandDialog({ open, onOpenChange, onCreate }: NewCommandDialogProps) {
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");
  const [description, setDescription] = useState("");

  function submit() {
    if (!name.trim() || !command.trim()) return;
    onCreate({ name, command, description });
    setName("");
    setCommand("");
    setDescription("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Command</DialogTitle>
          <DialogDescription>Create a new command in your project.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">Command name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="build" />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">Command</label>
            <Textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="npm run build"
              rows={2}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">Description (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Build the project"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onOpenChange.bind(null, false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Create Command</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { Button } from "@/components/ui/button";
import type { TerminalMetadata } from "@pixxl/shared";

interface EditTerminalDialogProps {
  terminal: TerminalMetadata | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, name: string) => void;
}

export function EditTerminalDialog({
  terminal,
  open,
  onOpenChange,
  onUpdate,
}: EditTerminalDialogProps) {
  const [name, setName] = useState(terminal?.name ?? "");

  // Sync name when terminal changes
  if (terminal && terminal.name !== name && !open) {
    setName(terminal.name);
  }

  function submit() {
    if (!terminal || !name.trim()) return;
    onUpdate(terminal.id, name);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Terminal</DialogTitle>
          <DialogDescription>Update terminal name.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">Terminal name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-terminal"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onOpenChange.bind(null, false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

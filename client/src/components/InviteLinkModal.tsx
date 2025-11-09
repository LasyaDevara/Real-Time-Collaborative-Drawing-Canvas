import { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InviteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteLink: string;
  maxUsers: number;
  currentUsers: number;
}

export default function InviteLinkModal({ isOpen, onClose, inviteLink, maxUsers, currentUsers }: InviteLinkModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-invite-link">
        <DialogHeader>
          <DialogTitle>Invite Friends to Collaborate</DialogTitle>
          <DialogDescription>
            Share this link with your friends to draw together in real-time.
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              Room capacity: {currentUsers}/{maxUsers} users
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              id="invite-link"
              value={inviteLink}
              readOnly
              data-testid="input-invite-link"
            />
          </div>
          <Button
            size="icon"
            onClick={handleCopy}
            data-testid="button-copy-link"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose} data-testid="button-close-modal">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

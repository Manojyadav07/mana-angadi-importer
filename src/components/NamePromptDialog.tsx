import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const t = {
  te: {
    title: "మీ పేరు చెప్పండి",
    description: "మన అంగడిలో మీకు స్వాగతం",
    placeholder: "మీ పేరు",
    save: "సేవ్ చేయండి",
    error: "పేరు 2-40 అక్షరాలు, అక్షరాలు & ఖాళీలు మాత్రమే.",
  },
  en: {
    title: "What's your name?",
    description: "Let us greet you properly",
    placeholder: "Your name",
    save: "Save",
    error: "Name must be 2-40 characters, letters & spaces only.",
  },
};

const NAME_REGEX = /^[\p{L}\s]{2,40}$/u;

interface NamePromptDialogProps {
  open: boolean;
  onComplete: () => void;
}

export function NamePromptDialog({ open, onComplete }: NamePromptDialogProps) {
  const { language } = useLanguage();
  const { updateProfile } = useAuth();
  const labels = t[language];

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmed = name.trim().replace(/\s+/g, " ");
    if (!NAME_REGEX.test(trimmed)) {
      setError(labels.error);
      return;
    }

    setSaving(true);
    const { error: updateError } = await updateProfile({ display_name: trimmed });
    setSaving(false);

    if (updateError) {
      toast.error(updateError.message);
      return;
    }

    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null); }}
            placeholder={labels.placeholder}
            className="input-auth"
            maxLength={40}
            autoFocus
          />
          {error && <p className="text-xs text-destructive px-1">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary-block"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : labels.save}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

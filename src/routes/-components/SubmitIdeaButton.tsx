import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useState } from "react";
import { IdeaFormHooked } from "./SubmitIdeaForm";

export default function SubmitIdeaButton({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="modern-button w-full sm:w-auto">
          <Plus className="h-5 w-5 mr-2" /> {text}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Submit a new idea
          </DialogTitle>
        </DialogHeader>
        <IdeaFormHooked onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

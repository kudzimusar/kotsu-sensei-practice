import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TestSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TestSelectionDialog = ({ open, onOpenChange }: TestSelectionDialogProps) => {
  const navigate = useNavigate();

  const handleTestSelect = (mode: 'permit' | 'license') => {
    onOpenChange(false);
    navigate(`/?test=${mode}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Select Test Type</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          <button
            onClick={() => handleTestSelect('permit')}
            className="w-full bg-white border-2 border-blue-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1">Learner's Permit Test</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>50 Questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>30 minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleTestSelect('license')}
            className="w-full bg-white border-2 border-purple-200 rounded-xl p-4 hover:border-purple-400 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1">Driver's License Test</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>100 Questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>60 minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestSelectionDialog;

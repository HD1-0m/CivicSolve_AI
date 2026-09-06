import React, { useState } from "react";
import { StorageService } from "../services/storage";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { AlertTriangle, X } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'challenge' | 'solution' | 'comment' | 'user';
  targetId: string;
  targetTitle?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [reason, setReason] = useState<'spam' | 'abuse' | 'false_information' | 'duplicate' | 'inappropriate_content' | 'other'>('spam');
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast("Please provide details for moderation review.", "error");
      return;
    }

    setSubmitting(true);
    try {
      StorageService.saveReport({
        reporterId: user?.id || "anonymous-reporter",
        reporterName: user?.name || "Community Member",
        targetType,
        targetId,
        targetTitle,
        reason,
        description,
      });

      showToast("Report submitted to Council Admins for review.", "success");
      onClose();
    } catch (err) {
      showToast("Failed to submit report.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-rose-600 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-bold text-stone-900 text-lg">Report Content</h3>
        </div>

        <p className="text-xs text-stone-500 mb-4">
          Flag {targetType} {targetTitle ? `"${targetTitle}"` : ""} for council moderation. CivicSolve strictly enforces safety, accuracy, and constructive engagement.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Reason for Report</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-800 focus:outline-emerald-600"
            >
              <option value="spam">Commercial advertisement / Spam</option>
              <option value="abuse">Hate speech / Harassment / Abusive content</option>
              <option value="false_information">Factually false / Misleading claims</option>
              <option value="duplicate">Exact duplicate of an existing challenge</option>
              <option value="inappropriate_content">Inappropriate or dangerous content</option>
              <option value="other">Other reason</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Detailed Explanation</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Explain why this content violates community guidelines or requires moderation..."
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-800 focus:outline-emerald-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

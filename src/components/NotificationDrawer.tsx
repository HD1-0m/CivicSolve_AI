import React from "react";
import { useNotifications } from "../context/NotificationContext";
import { Bell, Check, X, ExternalLink, Sparkles, FolderKanban, Lightbulb } from "lucide-react";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, param?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  if (!isOpen) return null;

  const handleItemClick = (link?: string, id?: string) => {
    if (id) markAsRead(id);
    if (link) {
      if (link.startsWith("/projects/")) {
        const projId = link.replace("/projects/", "");
        onNavigate("workspace", projId);
      } else if (link.startsWith("/challenges/")) {
        const chId = link.replace("/challenges/", "");
        onNavigate("challenge-detail", chId);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-2xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-stone-900 text-base">In-App Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {(notifications || []).length === 0 ? (
            <div className="text-center py-12 text-xs text-stone-400">
              No notifications yet. You will receive real-time updates when solutions are evaluated or projects updated.
            </div>
          ) : (
            (notifications || []).map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n.link, n.id)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                  n.isRead 
                    ? "bg-white border-stone-200 hover:bg-stone-50" 
                    : "bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>}
                    {n.title}
                  </div>
                  <span className="text-[10px] text-stone-400 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-stone-600 leading-relaxed mb-2">
                  {n.message}
                </p>
                {n.link && (
                  <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    Open item <ExternalLink className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>CivicSolve notification dispatch</span>
          <button
            onClick={() => (notifications || []).forEach(n => markAsRead(n.id))}
            className="text-emerald-700 font-medium hover:underline"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};

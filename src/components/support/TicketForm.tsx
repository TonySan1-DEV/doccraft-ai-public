import React, { useState } from "react";
import { Upload, X, Clock, Paperclip, Send, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  SupportTicket,
  TicketCategory,
  TicketPriority,
} from "../../types/SupportTypes";

interface TicketFormProps {
  onSubmit: (ticket: Partial<SupportTicket>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<SupportTicket>;
}

const CATEGORIES: { value: TicketCategory; label: string; icon: string }[] = [
  { value: "technical_issue", label: "Technical Issue", icon: "🔧" },
  { value: "billing", label: "Billing & Payment", icon: "💳" },
  { value: "feature_request", label: "Feature Request", icon: "💡" },
  { value: "bug_report", label: "Bug Report", icon: "🐛" },
  { value: "account_access", label: "Account Access", icon: "🔐" },
  { value: "general_inquiry", label: "General Inquiry", icon: "❓" },
  { value: "integration_help", label: "Integration Help", icon: "🔗" },
  { value: "performance", label: "Performance Issue", icon: "⚡" },
  { value: "security", label: "Security Concern", icon: "🛡️" },
  { value: "other", label: "Other", icon: "📝" },
];

const PRIORITIES: { value: TicketPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "text-green-600 bg-green-50" },
  { value: "medium", label: "Medium", color: "text-yellow-600 bg-yellow-50" },
  { value: "high", label: "High", color: "text-orange-600 bg-orange-50" },
  { value: "urgent", label: "Urgent", color: "text-red-600 bg-red-50" },
];

export const TicketForm: React.FC<TicketFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<SupportTicket>>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "general_inquiry",
    priority: initialData?.priority || "medium",
    tags: initialData?.tags || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [newTag, setNewTag] = useState("");

  const handleInputChange = (
    field: keyof SupportTicket,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim() || !formData.description?.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast.error("Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPriority = PRIORITIES.find(
    (pri) => pri.value === formData.priority
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onCancel}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create Support Ticket
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Describe your issue and we&apos;ll help you resolve it
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${selectedPriority?.color}`}
              >
                {selectedPriority?.label} Priority
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label
              htmlFor="ticket-category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
            >
              Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleInputChange("category", category.value)}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    formData.category === category.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <div className="text-2xl mb-1">{category.icon}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="ticket-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Title *
            </label>
            <input
              id="ticket-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Brief description of your issue"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              maxLength={100}
            />
            <div className="mt-1 text-sm text-gray-500">
              {formData.title?.length || 0}/100 characters
            </div>
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="ticket-priority"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
            >
              Priority *
            </label>
            <div className="flex space-x-3">
              {PRIORITIES.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleInputChange("priority", priority.value)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    formData.priority === priority.value
                      ? `${priority.color} border-current`
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="ticket-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description *
            </label>
            <textarea
              id="ticket-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Please provide detailed information about your issue..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
            />
            <div className="mt-1 text-sm text-gray-500">
              Be as detailed as possible to help us assist you quickly
            </div>
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="ticket-tags"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                id="ticket-tags"
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Attachments
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload files or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PNG, JPG, PDF, DOC up to 10MB each
                </p>
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.title?.trim() ||
                !formData.description?.trim()
              }
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Create Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

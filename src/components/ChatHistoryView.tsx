import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  ArrowRight,
  Clock,
  Mic,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { ConversationRecord, AppLanguage } from '../types';
import { fetchConversations, deleteConversation, updateConversationTitle, createConversation } from '../services/api';

interface ChatHistoryViewProps {
  language: AppLanguage;
  onOpenConversation: (conversationId: string) => void;
  onNewChat: () => void;
}

export const ChatHistoryView: React.FC<ChatHistoryViewProps> = ({
  language,
  onOpenConversation,
  onNewChat,
}) => {
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');

  const loadData = async (query?: string) => {
    try {
      setLoading(true);
      const data = await fetchConversations(query);
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(searchQuery);
  }, [searchQuery]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm(language === 'te' ? 'ఈ సంభాషణను తొలగించాలనుకుంటున్నారా?' : 'Are you sure you want to delete this consultation?')) {
      return;
    }
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert('Failed to delete conversation');
    }
  };

  const startRename = (e: React.MouseEvent, conv: ConversationRecord) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = async (e: React.MouseEvent | React.FormEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!editTitle.trim()) return;
    try {
      await updateConversationTitle(id, editTitle.trim());
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: editTitle.trim(), updatedAt: new Date().toISOString() } : c))
      );
      setEditingId(null);
    } catch (err) {
      alert('Failed to rename conversation');
    }
  };

  const handleCreateNew = async () => {
    try {
      const conv = await createConversation(
        language === 'te' ? 'కొత్త ఆరోగ్య సంభాషణ' : 'New Health Consultation',
        language
      );
      onOpenConversation(conv.id);
    } catch (err) {
      onNewChat();
    }
  };

  const filtered = conversations.filter((c) => {
    if (filterUrgency === 'all') return true;
    return c.triageUrgency === filterUrgency;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {language === 'te' ? 'సంభాషణల చరిత్ర' : 'Consultation History'}
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            {language === 'te'
              ? 'గతంలో చేసిన AI ఆరోగ్య సంభాషణలు, సింప్టమ్ ట్రయాజ్ మరియు వైద్యుల సారాంశాలు.'
              : 'Search, review, rename, or resume your previous clinical AI triage chats.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(searchQuery)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            {language === 'te' ? 'కొత్త సంభాషణ ప్రారంభించండి' : 'New Consultation'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'te' ? 'సంభాషణలను వెతకండి...' : 'Search consultations by symptoms or topic...'}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        {/* Urgency Filter */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-medium text-slate-500 mr-1 whitespace-nowrap">
            {language === 'te' ? 'స్థాయి:' : 'Urgency:'}
          </span>
          {[
            { id: 'all', label: language === 'te' ? 'అన్నీ' : 'All' },
            { id: 'emergency', label: language === 'te' ? 'అత్యవసరం' : 'Emergency', color: 'text-rose-700 bg-rose-50 border-rose-200' },
            { id: 'urgent', label: language === 'te' ? 'త్వరితం' : 'Urgent', color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { id: 'routine', label: language === 'te' ? 'సాధారణం' : 'Routine', color: 'text-teal-700 bg-teal-50 border-teal-200' },
            { id: 'self-care', label: language === 'te' ? 'స్వీయ సంరక్షణ' : 'Self-Care', color: 'text-sky-700 bg-sky-50 border-sky-200' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterUrgency(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap ${
                filterUrgency === item.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      {loading ? (
        <div className="py-16 text-center">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">
            {language === 'te' ? 'సంభాషణలను లోడ్ చేస్తోంది...' : 'Loading previous consultations...'}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {language === 'te' ? 'సంభాషణలు ఏవీ కనుగొనబడలేదు' : 'No Consultations Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            {searchQuery
              ? language === 'te'
                ? 'మీ శోధనకు సంబంధించిన ఫలితాలు లేవు. దయచేసి వేరొక పదం శోధించండి.'
                : 'No conversations matched your search keyword. Try clearing filters.'
              : language === 'te'
              ? 'మీరు ఇంకా ఎటువంటి సంభాషణలు చేయలేదు. కొత్త సంభాషణను ప్రారంభించండి.'
              : 'You have not conducted any symptom triage chats yet. Start a new one below.'}
          </p>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {language === 'te' ? 'కొత్త సంభాషణ ప్రారంభించండి' : 'Start First Consultation'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((conv) => {
            const urgencyBg =
              conv.triageUrgency === 'emergency'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : conv.triageUrgency === 'urgent'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : conv.triageUrgency === 'routine'
                ? 'bg-teal-50 text-teal-700 border-teal-200'
                : 'bg-slate-50 text-slate-600 border-slate-200';

            return (
              <div
                key={conv.id}
                onClick={() => onOpenConversation(conv.id)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-teal-400 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    {editingId === conv.id ? (
                      <form
                        onSubmit={(e) => handleSaveRename(e, conv.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 flex-1"
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-sm font-semibold border border-teal-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="bg-teal-600 text-white text-xs px-2.5 py-1 rounded-lg font-semibold hover:bg-teal-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-slate-500 text-xs px-2 py-1 rounded-lg hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition line-clamp-1 text-base">
                        {conv.title}
                      </h3>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => startRename(e, conv)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, conv.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {conv.lastMessagePreview ||
                      (language === 'te' ? 'సంభాషణ ఇంకా ప్రారంభించలేదు.' : 'No messages in this consultation yet.')}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(conv.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {conv.hasVoice && (
                      <span className="flex items-center gap-0.5 text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded text-[10px] font-medium" title="Includes voice dictation">
                        <Mic className="w-2.5 h-2.5" /> Voice
                      </span>
                    )}
                    {conv.triageUrgency && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${urgencyBg}`}>
                        {conv.triageUrgency.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 font-semibold text-teal-600 group-hover:translate-x-0.5 transition text-xs">
                    <span>{language === 'te' ? 'కొనసాగించండి' : 'Resume'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

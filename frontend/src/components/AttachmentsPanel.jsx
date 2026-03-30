import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Upload, Trash2, Eye, EyeOff, FileText, Image, FileVideo,
  FileAudio, Archive, File, Download, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

// ─── helpers ─────────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:5001';

function fileIcon(mime = '') {
  if (mime.startsWith('image/'))       return { icon: Image,     color: 'text-violet-500', bg: 'bg-violet-50' };
  if (mime.startsWith('video/'))       return { icon: FileVideo,  color: 'text-rose-500',   bg: 'bg-rose-50'   };
  if (mime.startsWith('audio/'))       return { icon: FileAudio,  color: 'text-amber-500',  bg: 'bg-amber-50'  };
  if (mime.includes('pdf'))            return { icon: FileText,   color: 'text-red-500',    bg: 'bg-red-50'    };
  if (mime.includes('zip') || mime.includes('compressed') || mime.includes('tar'))
                                       return { icon: Archive,    color: 'text-slate-500',  bg: 'bg-slate-100' };
  if (mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('csv'))
                                       return { icon: FileText,   color: 'text-emerald-500',bg: 'bg-emerald-50'};
  if (mime.includes('word') || mime.includes('document'))
                                       return { icon: FileText,   color: 'text-blue-500',   bg: 'bg-blue-50'   };
  return                                      { icon: File,       color: 'text-indigo-500', bg: 'bg-indigo-50' };
}

function formatBytes(bytes) {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

const avatarColors = [
  'bg-indigo-500','bg-violet-500','bg-rose-500','bg-emerald-500',
  'bg-amber-500','bg-sky-500','bg-pink-500','bg-teal-500',
];
function avatarColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * @param attachments  Attachment[]   — from Redux
 * @param uploading    bool           — spinner during upload
 * @param onUpload     (File) => void
 * @param onDelete     (attachmentId) => void
 * @param onView       (attachmentId) => void — called when user opens a file
 * @param currentUser  user object
 * @param mode         "project" | "task"
 * @param members      project.members (project mode) or task.assignees (task mode)
 *                     — used to build the "who has opened" row
 */
const AttachmentsPanel = ({
  attachments = [],
  uploading = false,
  onUpload,
  onDelete,
  onView,
  currentUser,
  mode = 'project',
  members = [],
}) => {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleFiles = (files) => {
    if (!files?.length) return;
    Array.from(files).forEach((f) => onUpload(f));
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  const handleOpen = (attachment) => {
    // Mark viewed, then open in new tab
    onView(attachment._id);
    const url = `${BASE_URL}/api/v1/attachments/file/${attachment._id}`;
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="space-y-5">
      {/* ── Drop zone / upload button ────────────────────────────────────── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none
          ${dragOver
            ? 'border-indigo-400 bg-indigo-50/60 scale-[1.01]'
            : 'border-slate-200 bg-slate-50/40 hover:border-indigo-300 hover:bg-indigo-50/30'
          }`}
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading
          ? <Loader2 size={28} className="text-indigo-500 animate-spin" />
          : <Upload size={28} className="text-indigo-400" />
        }
        <div className="text-center">
          <p className="text-sm font-bold text-slate-600">
            {uploading ? 'Uploading...' : 'Drop files here or click to browse'}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">All file types accepted · No size limit</p>
        </div>
      </div>

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {attachments.length === 0 && !uploading && (
        <div className="text-center py-8 text-slate-400">
          <File size={36} className="mx-auto mb-3 text-slate-200" />
          <p className="text-sm font-bold">No attachments yet</p>
          <p className="text-xs font-medium mt-1">Upload files to share with the team</p>
        </div>
      )}

      {/* ── File list ────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {attachments.map((att) => {
          const { icon: FileIcon, color, bg } = fileIcon(att.mimetype);
          const isOwner = currentUser?._id === att.uploadedBy?._id || currentUser?._id === att.uploadedBy;
          const isDeleting = deletingId === att._id;

          // build viewer set for "seen by" row
          // project mode → all members; task mode → assignees only
          const viewedByIds = new Set((att.viewedBy || []).map((v) => v.user?._id || v.user));
          const relevantMembers = members.filter(Boolean);

          return (
            <div
              key={att._id}
              className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-100 hover:shadow-sm transition-all group"
            >
              {/* ── Row 1: icon + name + actions ─────────────────────── */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <FileIcon size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => handleOpen(att)}
                    className="text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors text-left truncate max-w-full block"
                    title={att.originalName}
                  >
                    {att.originalName}
                  </button>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">{formatBytes(att.size)}</span>
                    <span className="text-slate-200">·</span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {att.createdAt ? format(new Date(att.createdAt), 'MMM d, yyyy') : '—'}
                    </span>
                    <span className="text-slate-200">·</span>
                    {/* Uploader */}
                    <div className="flex items-center gap-1">
                      <div className={`w-4 h-4 rounded-full ${avatarColor(att.uploadedBy?.username || '')} flex items-center justify-center text-[8px] font-black text-white`}>
                        {att.uploadedBy?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{att.uploadedBy?.username || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => handleOpen(att)}
                    title="Open file"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Download size={15} />
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(att._id)}
                      disabled={isDeleting}
                      title="Delete file"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  )}
                </div>
              </div>

              {/* ── Row 2: Seen by badges ────────────────────────────── */}
              {relevantMembers.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    {mode === 'task' ? 'Assignee opened' : 'Seen by'}
                  </span>
                  {relevantMembers.map((m) => {
                    const uid = m._id || m;
                    const username = m.username || '?';
                    const seen = viewedByIds.has(uid);
                    return (
                      <div
                        key={uid}
                        title={`${username} — ${seen ? 'opened' : 'not opened'}`}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                          seen
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : 'bg-slate-50 border-slate-100 text-slate-400'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${avatarColor(username)} flex items-center justify-center text-[7px] font-black text-white`}>
                          {username[0]?.toUpperCase()}
                        </div>
                        {username}
                        {seen
                          ? <CheckCircle2 size={10} className="text-emerald-500 ml-0.5" />
                          : <EyeOff size={9} className="text-slate-300 ml-0.5" />
                        }
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttachmentsPanel;

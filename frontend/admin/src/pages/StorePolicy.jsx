import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import './StorePolicy.css';
import { AdminContext } from '../context/AdminContextProvider';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';

const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32', '36'];

// ── SVG Icons ─────────────────────────────────────────────────
function AlignLeftIcon()   { return <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><rect x="0" y="2" width="16" height="2" rx="1"/><rect x="0" y="7" width="10" height="2" rx="1"/><rect x="0" y="12" width="13" height="2" rx="1"/></svg>; }
function AlignCenterIcon() { return <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><rect x="0" y="2" width="16" height="2" rx="1"/><rect x="3" y="7" width="10" height="2" rx="1"/><rect x="1.5" y="12" width="13" height="2" rx="1"/></svg>; }
function AlignRightIcon()  { return <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><rect x="0" y="2" width="16" height="2" rx="1"/><rect x="6" y="7" width="10" height="2" rx="1"/><rect x="3" y="12" width="13" height="2" rx="1"/></svg>; }
function BulletIcon()      { return <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><circle cx="2" cy="4" r="1.5"/><rect x="5" y="3" width="11" height="2" rx="1"/><circle cx="2" cy="9" r="1.5"/><rect x="5" y="8" width="11" height="2" rx="1"/><circle cx="2" cy="14" r="1.5"/><rect x="5" y="13" width="11" height="2" rx="1"/></svg>; }
function NumberIcon()      { return <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><text x="0" y="5" fontSize="5" fill="currentColor">1.</text><rect x="5" y="3" width="11" height="1.8" rx="0.9"/><text x="0" y="10" fontSize="5" fill="currentColor">2.</text><rect x="5" y="8" width="11" height="1.8" rx="0.9"/><text x="0" y="15" fontSize="5" fill="currentColor">3.</text><rect x="5" y="13" width="11" height="1.8" rx="0.9"/></svg>; }
function IndentIcon()      { return <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><rect x="0" y="2" width="16" height="1.8" rx="0.9"/><rect x="4" y="6" width="12" height="1.8" rx="0.9"/><rect x="4" y="10" width="12" height="1.8" rx="0.9"/><rect x="0" y="14" width="16" height="1.8" rx="0.9"/><path d="M0 8l3-2.5v5z"/></svg>; }
function OutdentIcon()     { return <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><rect x="0" y="2" width="16" height="1.8" rx="0.9"/><rect x="4" y="6" width="12" height="1.8" rx="0.9"/><rect x="4" y="10" width="12" height="1.8" rx="0.9"/><rect x="0" y="14" width="16" height="1.8" rx="0.9"/><path d="M3 8L0 5.5v5z"/></svg>; }
function EyeIcon()         { return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function SaveIcon()        { return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>; }
function CloseIcon()       { return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function DocIcon()         { return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>; }

// ─────────────────────────────────────────────────────────────────────────────
// RICH TEXT ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function closest(node, tagName) {
  let n = node.nodeType === 3 ? node.parentElement : node;
  while (n) {
    if (n.tagName && n.tagName.toLowerCase() === tagName.toLowerCase()) return n;
    n = n.parentElement;
  }
  return null;
}
function isInTag(tagName) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  return !!closest(sel.getRangeAt(0).commonAncestorContainer, tagName);
}
function toggleInline(editor, tagName) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  let ancestor = range.commonAncestorContainer;
  if (ancestor.nodeType === 3) ancestor = ancestor.parentElement;
  const existing = ancestor ? ancestor.closest(tagName) : null;
  if (existing) {
    const parent = existing.parentNode;
    while (existing.firstChild) parent.insertBefore(existing.firstChild, existing);
    parent.removeChild(existing);
    return;
  }
  if (range.collapsed) return;
  const wrapper = document.createElement(tagName);
  wrapper.appendChild(range.extractContents());
  range.insertNode(wrapper);
  const newRange = document.createRange();
  newRange.selectNodeContents(wrapper);
  sel.removeAllRanges();
  sel.addRange(newRange);
}
function toggleList(editor, listTag) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  let startNode = range.startContainer;
  if (startNode.nodeType === 3) startNode = startNode.parentElement;
  const otherTag = listTag === 'ul' ? 'ol' : 'ul';
  const existingList = startNode.closest(listTag);
  const otherList = startNode.closest(otherTag);
  if (existingList) {
    const frag = document.createDocumentFragment();
    Array.from(existingList.querySelectorAll(':scope > li')).forEach(li => {
      const p = document.createElement('p');
      p.innerHTML = li.innerHTML || '<br>';
      frag.appendChild(p);
    });
    existingList.parentNode.replaceChild(frag, existingList);
    return;
  }
  if (otherList) {
    const newList = document.createElement(listTag);
    Array.from(otherList.querySelectorAll(':scope > li')).forEach(li => {
      const newLi = document.createElement('li');
      newLi.innerHTML = li.innerHTML || '<br>';
      newList.appendChild(newLi);
    });
    otherList.parentNode.replaceChild(newList, otherList);
    const firstLi = newList.querySelector('li');
    if (firstLi) { const r = document.createRange(); r.selectNodeContents(firstLi); r.collapse(false); sel.removeAllRanges(); sel.addRange(r); }
    return;
  }
  let block = startNode.closest('p, div, h1, h2, h3, h4, h5, h6');
  if (!block || block === editor) {
    const li = document.createElement('li'); li.innerHTML = '<br>';
    const list = document.createElement(listTag); list.appendChild(li);
    range.deleteContents(); range.insertNode(list);
    const r = document.createRange(); r.setStart(li, 0); r.collapse(true); sel.removeAllRanges(); sel.addRange(r);
    return;
  }
  const li = document.createElement('li'); li.innerHTML = block.innerHTML || '<br>';
  const list = document.createElement(listTag); list.appendChild(li);
  block.parentNode.replaceChild(list, block);
  const r = document.createRange(); r.selectNodeContents(li); r.collapse(false); sel.removeAllRanges(); sel.addRange(r);
}
function sanitizeEditorColors(editor) {
  if (!editor) return;
  editor.querySelectorAll('[style]').forEach(el => {
    const c = el.style.color.replace(/\s/g, '').toLowerCase();
    if (c === 'white' || c === '#fff' || c === '#ffffff' || c === 'rgb(255,255,255)' || c === 'rgba(255,255,255,1)') {
      el.style.removeProperty('color');
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const StorePolicy = () => {
  const { toastSuccess, toastError, addStorePolicy, updateStorePolicy, fetchStorePolicy} = useContext(AdminContext);

  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [activeFormats, setActiveFormats] = useState(new Set());
  const [fontSize, setFontSize] = useState('16');
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  // Tracks whether a DB row already exists — drives add vs update decision
  const [existingPolicy, setExistingPolicy]     = useState(null);
  const editorRef = useRef(null);

  // ── Load content: DB first, then localStorage draft fallback ──
  useEffect(() => {
    if (!editorRef.current) return;
    if (fetchStorePolicy && fetchStorePolicy.content) {
      // DB record exists → populate editor & track it
      editorRef.current.innerHTML = fetchStorePolicy.content;
      setExistingPolicy(fetchStorePolicy);
      setLastSaved(new Date(fetchStorePolicy.updatedAt));
    } else {
      // No DB record yet → restore local draft if any
      const draft = localStorage.getItem('sp_terms_content');
      if (draft) editorRef.current.innerHTML = draft;
    }
    updateCharCount();
  }, [fetchStorePolicy]);

  // Ctrl+S — dependency on existingPolicy keeps closure current
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSubmit(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [existingPolicy]);

  const updateCharCount = useCallback(() => {
    if (editorRef.current) setCharCount(editorRef.current.innerText.length);
  }, []);

  const autosave = useCallback(() => {
    if (editorRef.current) localStorage.setItem('sp_terms_content', editorRef.current.innerHTML);
  }, []);

  const updateActiveFormats = useCallback(() => {
    const f = new Set();
    try {
      if (document.queryCommandState('bold'))          f.add('bold');
      if (document.queryCommandState('italic'))        f.add('italic');
      if (document.queryCommandState('underline'))     f.add('underline');
      if (document.queryCommandState('justifyCenter')) f.add('justifyCenter');
      if (document.queryCommandState('justifyRight'))  f.add('justifyRight');
      if (document.queryCommandState('justifyLeft'))   f.add('justifyLeft');
    } catch {}
    if (isInTag('del') || isInTag('s') || isInTag('strike')) f.add('strikeThrough');
    if (isInTag('ul')) f.add('insertUnorderedList');
    if (isInTag('ol')) f.add('insertOrderedList');
    setActiveFormats(f);
  }, []);

  const afterCmd = useCallback(() => {
    sanitizeEditorColors(editorRef.current);
    updateActiveFormats();
    updateCharCount();
    autosave();
  }, [updateActiveFormats, updateCharCount, autosave]);

  const execCmd = useCallback((cmd) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    switch (cmd) {
      case 'bold':                    document.execCommand('bold', false, null); break;
      case 'italic':                  document.execCommand('italic', false, null); break;
      case 'underline':               document.execCommand('underline', false, null); break;
      case 'justifyLeft':
      case 'justifyCenter':
      case 'justifyRight':            document.execCommand(cmd, false, null); break;
      case 'indent':                  document.execCommand('indent', false, null); break;
      case 'outdent':                 document.execCommand('outdent', false, null); break;
      case 'strikeThrough':           toggleInline(editorRef.current, 'del'); break;
      case 'insertUnorderedList':     toggleList(editorRef.current, 'ul'); break;
      case 'insertOrderedList':       toggleList(editorRef.current, 'ol'); break;
      default:                        document.execCommand(cmd, false, null);
    }
    afterCmd();
  }, [afterCmd]);

  const handleFontSize = (size) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const map = { '12':'1','13':'2','14':'2','16':'3','18':'4','20':'4','24':'5','28':'6','32':'6','36':'7' };
    document.execCommand('fontSize', false, map[size] || '3');
    setFontSize(size);
    afterCmd();
  };

  const handleInput = () => {
    sanitizeEditorColors(editorRef.current);
    updateCharCount();
    updateActiveFormats();
    autosave();
  };

  // ── SAVE: add (first time) or update (already exists) ──
  const handleSubmit = async () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const text    = editorRef.current.innerText.trim();

    if (!text) {
      toast.error('Terms & Conditions cannot be empty.', { ...toastError });
      return;
    }

    setLoading(true);
    const payload = { content };

    // If we already loaded a record from DB → update, otherwise → add
    const result = existingPolicy ? await updateStorePolicy(payload) : await addStorePolicy(payload);

    if (result) {
      toast.success('Terms & Conditions saved successfully!', { ...toastSuccess });
      setExistingPolicy(result);              // marks that a row now exists
      setLastSaved(new Date());
      localStorage.removeItem('sp_terms_content');  // DB is now the source of truth
    } else {
      toast.error('Failed to save. Please try again.', { ...toastError });
    }

    setLoading(false);
  };

  const handleClear = () => setClearConfirmOpen(true);
  const confirmClear = () => {
    if (editorRef.current) { editorRef.current.innerHTML = ''; setCharCount(0); localStorage.removeItem('sp_terms_content'); }
    setClearConfirmOpen(false);
  };

  const TOOLBAR_GROUPS = [
    { label: 'Text Style', buttons: [
      { cmd: 'bold',          icon: <b style={{fontFamily:'serif',fontWeight:900}}>B</b>,                           title: 'Bold' },
      { cmd: 'italic',        icon: <i style={{fontFamily:'serif',fontStyle:'italic'}}>I</i>,                       title: 'Italic' },
      { cmd: 'underline',     icon: <span style={{textDecoration:'underline',fontWeight:700}}>U</span>,             title: 'Underline' },
      { cmd: 'strikeThrough', icon: <span style={{textDecoration:'line-through',fontWeight:700}}>S</span>,          title: 'Strikethrough' },
    ]},
    { label: 'Alignment', buttons: [
      { cmd: 'justifyLeft',   icon: <AlignLeftIcon />,   title: 'Align Left' },
      { cmd: 'justifyCenter', icon: <AlignCenterIcon />, title: 'Align Center' },
      { cmd: 'justifyRight',  icon: <AlignRightIcon />,  title: 'Align Right' },
    ]},
    { label: 'Lists', buttons: [
      { cmd: 'insertUnorderedList', icon: <BulletIcon />, title: 'Bullet List' },
      { cmd: 'insertOrderedList',   icon: <NumberIcon />, title: 'Numbered List' },
    ]},
    { label: 'Indent', buttons: [
      { cmd: 'indent',  icon: <IndentIcon />,  title: 'Indent' },
      { cmd: 'outdent', icon: <OutdentIcon />, title: 'Outdent' },
    ]},
  ];

  return (
    <>
      {loading && <Loading />}
      <Navbar TitleName="Store Policy" />

      <div className="sp-page">
        <div className="sp-page-header">
          <div className="sp-page-header-left">
            <div className="sp-page-icon"><DocIcon /></div>
            <div>
              <h1 className="sp-page-title">Terms &amp; Conditions</h1>
              <p className="sp-page-subtitle">Define your store policies visible to all customers</p>
            </div>
          </div>
          {lastSaved && <div className="sp-last-saved">Last saved: {lastSaved.toLocaleTimeString()}</div>}
        </div>

        <div className="sp-editor-card">
          <div className="sp-toolbar">
            <div className="sp-toolbar-group sp-font-size-group">
              <label className="sp-toolbar-group-label">Size</label>
              <div className="sp-select-wrap">
                <select className="sp-font-select" value={fontSize} onChange={(e) => handleFontSize(e.target.value)}>
                  {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
                </select>
              </div>
            </div>
            <div className="sp-toolbar-divider" />
            {TOOLBAR_GROUPS.map((group, gi) => (
              <React.Fragment key={gi}>
                <div className="sp-toolbar-group">
                  <label className="sp-toolbar-group-label">{group.label}</label>
                  <div className="sp-toolbar-btns">
                    {group.buttons.map(btn => (
                      <button key={btn.cmd} className={`sp-tool-btn ${activeFormats.has(btn.cmd) ? 'sp-tool-btn--active' : ''}`} title={btn.title} onMouseDown={(e) => { e.preventDefault(); execCmd(btn.cmd); }}>{btn.icon}</button>
                    ))}
                  </div>
                </div>
                {gi < TOOLBAR_GROUPS.length - 1 && <div className="sp-toolbar-divider" />}
              </React.Fragment>
            ))}
          </div>

          <div ref={editorRef} className="sp-editor" contentEditable suppressContentEditableWarning onInput={handleInput} onKeyUp={updateActiveFormats} onMouseUp={updateActiveFormats} data-placeholder="Start writing your Terms & Conditions here…&#10;&#10;You can use the toolbar above to format your text with bold, italic, lists, and more." />

          <div className="sp-editor-footer">
            <span className="sp-char-count">{charCount.toLocaleString()} characters</span>
            <button className="sp-clear-btn" onClick={handleClear}>Clear</button>
          </div>
        </div>

        <div className="sp-action-bar">
          <button className="sp-preview-btn" onClick={() => setPreviewOpen(true)}><EyeIcon /><span>Preview</span></button>
          <button className="sp-save-btn" onClick={handleSubmit}><SaveIcon /><span>Save &amp; Publish</span></button>
        </div>
        <p className="sp-shortcut-hint">Tip: Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save quickly</p>
      </div>

      {previewOpen && (
        <div className="sp-preview-overlay" onClick={() => setPreviewOpen(false)}>
          <div className="sp-preview-modal" onClick={e => e.stopPropagation()}>
            <div className="sp-preview-topbar">
              <div className="sp-preview-topbar-left"><div className="sp-preview-dot sp-preview-dot--red" /><div className="sp-preview-dot sp-preview-dot--yellow" /><div className="sp-preview-dot sp-preview-dot--green" /></div>
              <div className="sp-preview-topbar-title">Customer Preview</div>
              <button className="sp-preview-close" onClick={() => setPreviewOpen(false)}><CloseIcon /></button>
            </div>
            <div className="sp-preview-header">
              <div className="sp-preview-store-badge">Store Policy</div>
              <h2 className="sp-preview-heading">Terms &amp; Conditions</h2>
              <p className="sp-preview-meta">Please read these terms carefully before placing an order.</p>
            </div>
            <div className="sp-preview-body">
              {editorRef.current?.innerHTML.trim() ? (
                <div className="sp-preview-content" dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML }} />
              ) : (
                <div className="sp-preview-empty">
                  <svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="#ccc" strokeWidth="2"><rect x="8" y="4" width="48" height="56" rx="4"/><line x1="20" y1="20" x2="44" y2="20"/><line x1="20" y1="28" x2="44" y2="28"/><line x1="20" y1="36" x2="36" y2="36"/></svg>
                  <p>Nothing to preview yet.<br />Start writing in the editor.</p>
                </div>
              )}
            </div>
            <div className="sp-preview-footer">
              <span className="sp-preview-footer-note">This is how customers will see your Terms &amp; Conditions</span>
              <button className="sp-preview-close-btn" onClick={() => setPreviewOpen(false)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {clearConfirmOpen && (
        <div className="sp-confirm-overlay" onClick={() => setClearConfirmOpen(false)}>
          <div className="sp-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="sp-confirm-icon-wrap">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div className="sp-confirm-body">
              <h3 className="sp-confirm-title">Clear All Content?</h3>
              <p className="sp-confirm-desc">This will permanently remove everything in the editor. This action <strong>cannot be undone</strong>.</p>
            </div>
            <div className="sp-confirm-actions">
              <button className="sp-confirm-delete" onClick={confirmClear}>Yes</button>
              <button className="sp-confirm-cancel" onClick={() => setClearConfirmOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StorePolicy;
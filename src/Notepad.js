import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Check, X, Loader2, Sun, Moon, Copy, FileText,
  Bold, Italic, Underline, Link, AlignLeft, AlignCenter,
  AlignRight, List, ListOrdered, IndentDecrease, IndentIncrease,
  Palette, MoveVertical
} from 'lucide-react';

// Translation setup
const TRANSLATIONS = { /* (Insert your translation object here unchanged) */ };
const appLocale = '{{APP_LOCALE}}';
const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US';
const findMatchingLocale = (locale) => {
  if (TRANSLATIONS[locale]) return locale;
  const lang = locale.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find(key => key.startsWith(lang + '-'));
  return match || 'en-US';
};
const locale = (appLocale !== '{{APP_LOCALE}}') ? findMatchingLocale(appLocale) : findMatchingLocale(browserLocale);
const t = (key) => TRANSLATIONS[locale]?.[key] || TRANSLATIONS['en-US'][key] || key;

function TextEditor() {
  const [text, setText] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const editorRef = useRef(null);

  const updateContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.querySelectorAll('mark').forEach(mark => {
        const textNode = document.createTextNode(mark.textContent);
        mark.parentNode.replaceChild(textNode, mark);
      });
      tempDiv.innerHTML = tempDiv.innerHTML.replace(/<br\s*\/?\>/gi, '\n');
      setText(tempDiv.textContent || '');
    }
  };

  const formatText = (command, value = null) => {
    editorRef.current.focus();
    document.execCommand(command, false, value);
    updateContent();
  };

  const copyText = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorRef.current.innerHTML;
    tempDiv.querySelectorAll('mark').forEach(mark => {
      const span = document.createElement('span');
      span.innerHTML = mark.innerHTML;
      mark.parentNode.replaceChild(span, mark);
    });
    document.body.appendChild(tempDiv);
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    document.body.removeChild(tempDiv);
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" /> {t('appTitle')}
        </h1>
        <button onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-gray-800" />}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => formatText('bold')}><Bold className="w-4 h-4" /></button>
        <button onClick={() => formatText('italic')}><Italic className="w-4 h-4" /></button>
        <button onClick={() => formatText('underline')}><Underline className="w-4 h-4" /></button>
        <button onClick={copyText}><Copy className="w-4 h-4" /></button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        className={`w-full h-80 p-4 border rounded-md overflow-y-auto ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
        style={{ fontFamily: 'Arial', fontSize: '16px', lineHeight: '1.6' }}
      ></div>

      <p className="mt-4 text-sm text-gray-500">{text.length} {t('characters')}</p>
    </div>
  );
}

export default TextEditor;

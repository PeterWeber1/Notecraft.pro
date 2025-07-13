import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Check, X, Loader2, Sun, Moon, Copy, FileText,
  Bold, Italic, Underline, Link, AlignLeft, AlignCenter,
  AlignRight, List, ListOrdered, IndentDecrease, IndentIncrease,
  Palette, MoveVertical
} from 'lucide-react';

const TRANSLATIONS = {
  "en-US": {
    "appTitle": "NoteCraft Notepad",
    "yourText": "Your Text",
    "sample": "Sample",
    "copy": "Copy",
    "fontFamily": "Font Family",
    "fontSize": "Font Size",
    "bold": "Bold",
    "italic": "Italic",
    "underline": "Underline",
    "textColor": "Text Color",
    "addLink": "Add Link",
    "alignLeft": "Align Left",
    "alignCenter": "Align Center",
    "alignRight": "Align Right",
    "lineSpacing": "Line Spacing",
    "bulletList": "Bullet List",
    "numberedList": "Numbered List",
    "decreaseIndent": "Decrease Indent",
    "increaseIndent": "Increase Indent",
    "addLinkTitle": "Add Link",
    "enterUrl": "Enter URL",
    "add": "Add",
    "cancel": "Cancel",
    "characters": "characters",
    "analyzeText": "Analyze Text",
    "analyzing": "Analyzing...",
    "suggestions": "Suggestions",
    "all": "All",
    "grammar": "Grammar",
    "spelling": "Spelling",
    "punctuation": "Punctuation",
    "style": "Style",
    "clarity": "Clarity",
    "clickAnalyzeText": "Click 'Analyze Text' to get suggestions",
    "noSuggestionsCategory": "No suggestions in this category",
    "applySuggestion": "Apply suggestion",
    "dismiss": "Dismiss",
    "textHighlightColor": "Text highlight color",
    "applyAllSuggestions": "Apply All Suggestions",
    "pleaseEnterText": "Please enter some text to analyze",
    "failedToAnalyze": "Failed to analyze text. Please try again.",
    "failedToParse": "Failed to parse suggestions. Please try again.",
    "reject": "Reject",
    "accept": "Accept"
  }
};

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
  const [suggestions, setSuggestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLineSpacing, setShowLineSpacing] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, isBelow: false });
  const editorRef = useRef(null);
  const categories = [
    { id: 'all', label: t('all'), color: 'bg-purple-500' },
    { id: 'grammar', label: t('grammar'), color: 'bg-blue-500' },
    { id: 'spelling', label: t('spelling'), color: 'bg-red-500' },
    { id: 'punctuation', label: t('punctuation'), color: 'bg-yellow-500' },
    { id: 'style', label: t('style'), color: 'bg-green-500' },
    { id: 'clarity', label: t('clarity'), color: 'bg-indigo-500' }
  ];

  const sampleTexts = [
    'Human welfare is at the heart of our work at Anthropic: our mission is to make sure that increasingly capable and sophisticated AI systems remain beneficial to humanity.\n\nBut as we build those AI systems, and as they begin to approximate or surpass many human qualities, another question arises. Should we also be concerned about the potential consciousness and experiences of the models themselves? Should we be concerned about *model welfare*, too?\n\nThis is an open question, and one that\'s both philosophically and scientifically difficult. But now that models can communicate, relate, plan, problem-solve, and pursue goals—along with very many more characteristics we associate with people—we think it\'s time to address it.\n\nTo that end, we recently started a research program to investigate, and prepare to navigate, model welfare.'
  ];

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'];

  const fonts = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS' }
  ];

  const textSizes = [
    { value: '13.33px', label: '10' },
    { value: '14.67px', label: '11' },
    { value: '16px', label: '12' },
    { value: '18.67px', label: '14' },
    { value: '21.33px', label: '16' },
    { value: '24px', label: '18' },
    { value: '32px', label: '24' },
    { value: '48px', label: '36' }
  ];

  const lineSpacings = [
    { value: '1', label: '1.0' },
    { value: '1.15', label: '1.15' },
    { value: '1.5', label: '1.5' },
    { value: '2', label: '2.0' }
  ];

  const updateContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);

      setActiveTooltip(null);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const marks = tempDiv.querySelectorAll('mark');
      marks.forEach(mark => {
        const textNode = document.createTextNode(mark.textContent);
        mark.parentNode.replaceChild(textNode, mark);
      });

      tempDiv.innerHTML = tempDiv.innerHTML.replace(/<br\\s*\\/?\\>/gi, '\\n');
      const plainText = tempDiv.textContent || '';
      setText(plainText);
    }
  };

  const formatText = (command, value = null) => {
    editorRef.current?.focus();

    if (command === 'fontSize') {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);

      if (range.collapsed) {
        const allContent = editorRef.current.childNodes;
        allContent.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            const span = document.createElement('span');
            span.style.fontSize = value;
            span.style.fontFamily = 'Arial';
            span.textContent = node.textContent;
            node.parentNode.replaceChild(span, node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            node.style.fontSize = value;
          }
        });
      } else {
        try {
          const contents = range.extractContents();
          const span = document.createElement('span');
          span.style.fontSize = value;
          while (contents.firstChild) {
            span.appendChild(contents.firstChild);
          }
          range.insertNode(span);
          range.selectNodeContents(span);
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e) {
          document.execCommand('fontSize', false, '7');
          const tempFonts = editorRef.current.querySelectorAll('font[size=\"7\"]');
          tempFonts.forEach(font => {
            const span = document.createElement('span');
            span.style.fontSize = value;
            span.innerHTML = font.innerHTML;
            font.parentNode.replaceChild(span, font);
          });
        }
      }
    } else if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let node = range.commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
        const inList = node.closest('ul, ol');

        if (inList) {
          document.execCommand(command, false, null);
        } else {
          const block = node.closest('div, p');
          if (!block || block === editorRef.current) {
            document.execCommand('formatBlock', false, 'div');
          }
          setTimeout(() => {
            document.execCommand(command, false, null);
            editorRef.current.focus();
          }, 10);
        }
      }
    } else if (command === 'indent' || command === 'outdent') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let node = range.commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
        const listItem = node.closest('li');
        if (listItem) {
          document.execCommand(command, false, null);
        } else {
          const block = node.closest('div, p') || node;
          if (block && block !== editorRef.current) {
            const currentMargin = parseInt(block.style.marginLeft || 0);
            if (command === 'indent') {
              block.style.marginLeft = `${currentMargin + 40}px`;
            } else if (currentMargin > 0) {
              block.style.marginLeft = `${Math.max(0, currentMargin - 40)}px`;
            }
          }
        }
      }
    } else {
      document.execCommand(command, false, value);
    }

    editorRef.current?.focus();
    updateContent();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;

    const paragraphs = text.split(/\n\n+/);
    const cleanHTML = paragraphs
      .map(paragraph => {
        const lines = paragraph.split('\n');
        const paragraphHTML = lines
          .map(line => line.trim())
          .filter(line => line)
          .join('<br>');
        return `<div style="font-family: Arial; font-size: 16px;">${paragraphHTML}</div>`;
      })
      .filter(html => html)
      .join('<div><br></div>');

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    selection.deleteFromDocument();
    const range = selection.getRangeAt(0);
    const fragment = range.createContextualFragment(cleanHTML);
    range.insertNode(fragment);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    updateContent();
  };

  const handleCopy = (e) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const clonedSelection = range.cloneContents();
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(clonedSelection);

    const marks = tempDiv.querySelectorAll('mark');
    marks.forEach(mark => {
      const span = document.createElement('span');
      span.innerHTML = mark.innerHTML;
      const parent = mark.parentElement;
      if (parent && parent.style.fontSize) {
        span.style.fontSize = parent.style.fontSize;
      }
      if (parent && parent.style.fontFamily) {
        span.style.fontFamily = parent.style.fontFamily;
      }
      mark.parentNode.replaceChild(span, mark);
    });

    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
      el.style.backgroundColor = '';
      el.style.background = '';
      el.style.backgroundImage = '';
      el.style.backgroundClip = '';
      el.style.webkitBackgroundClip = '';
      el.style.webkitTextFillColor = '';
    });

    e.clipboardData.setData('text/plain', tempDiv.textContent);
    e.clipboardData.setData('text/html', tempDiv.innerHTML);
    e.preventDefault();
  };

  const insertLink = () => {
    if (linkUrl) {
      formatText('createLink', linkUrl);
      setShowLinkDialog(false);
      setLinkUrl('');
    }
  };

  const analyzeText = async () => {
    if (editorRef.current) {
      let content = editorRef.current.innerHTML;
      content = content.replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1');
      editorRef.current.innerHTML = content;
      updateContent();
    }

    if (!text.trim()) {
      setError(t('pleaseEnterText'));
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setSuggestions([]);

    try {
      const textToAnalyze = text;
      const prompt = `Analyze the following text and provide specific suggestions for improvement. Focus on grammar, spelling, punctuation, style, and clarity. Please respond in ${locale} language.\n\nText to analyze:\n"${textToAnalyze}"\n\nIMPORTANT: When identifying issues, preserve the EXACT text including all quotation marks, apostrophes, and special characters. Respond with a JSON array of suggestion objects.`;

      const response = await window.claude.complete(prompt);

      try {
        const parsedSuggestions = JSON.parse(response);
        if (Array.isArray(parsedSuggestions)) {
          setSuggestions(parsedSuggestions);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        setError(t('failedToParse'));
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(t('failedToAnalyze'));
    } finally {
      setIsAnalyzing(false);
    }
  };
  const applySuggestion = (suggestion) => {
    if (!editorRef.current) return;

    let content = editorRef.current.innerHTML;
    content = content.replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1');

    const issueText = suggestion.issue;
    const replacementText = suggestion.suggestion;

    const escapeHtml = (text) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const patterns = [
      issueText,
      escapeHtml(issueText),
      issueText.replace(/"/g, '&quot;').replace(/'/g, '&#039;')
    ];

    let replaced = false;
    for (const pattern of patterns) {
      if (content.includes(pattern)) {
        content = content.replace(pattern, escapeHtml(replacementText));
        replaced = true;
        break;
      }
    }

    if (!replaced) {
      console.log(`Could not find text to replace: "${issueText}"`);
    }

    editorRef.current.innerHTML = content;
    updateContent();

    setSuggestions(suggestions.filter(s => s !== suggestion));

    if (activeTooltip && activeTooltip.issue === suggestion.issue) {
      setActiveTooltip(null);
    }
  };

  const dismissSuggestion = (suggestion) => {
    setSuggestions(suggestions.filter(s => s !== suggestion));
    if (activeTooltip && activeTooltip.issue === suggestion.issue) {
      setActiveTooltip(null);
    }
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : 'bg-gray-500';
  };

  const filteredSuggestions = activeCategory === 'all'
    ? suggestions
    : suggestions.filter(s => s.category === activeCategory);

  const copyText = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorRef.current.innerHTML;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.whiteSpace = 'pre-wrap';
    document.body.appendChild(tempDiv);

    const marks = tempDiv.querySelectorAll('mark');
    marks.forEach(mark => {
      const span = document.createElement('span');
      span.innerHTML = mark.innerHTML;
      const parent = mark.parentElement;
      if (parent && parent.style.fontSize) {
        span.style.fontSize = parent.style.fontSize;
      }
      if (parent && parent.style.fontFamily) {
        span.style.fontFamily = parent.style.fontFamily;
      }
      mark.parentNode.replaceChild(span, mark);
    });

    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
      el.style.backgroundColor = '';
      el.style.background = '';
      el.style.backgroundImage = '';
      el.style.backgroundClip = '';
      el.style.webkitBackgroundClip = '';
      el.style.webkitTextFillColor = '';
    });

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    selection.removeAllRanges();
    selection.addRange(range);

    try {
      document.execCommand('copy');
      selection.removeAllRanges();
      document.body.removeChild(tempDiv);
    } catch (err) {
      document.body.removeChild(tempDiv);
      navigator.clipboard.writeText(text);
    }
  };
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML === '') {
      editorRef.current.innerHTML = '<div><br></div>';
    }
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;

    const handleEditorClick = (e) => {
      if (e.target.tagName === 'MARK') {
        const issueText = decodeURIComponent(e.target.getAttribute('data-issue') || '');
        const match = suggestions.find(s => s.issue === issueText);
        if (!match) return;

        const rect = e.target.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();
        let top = rect.top - editorRect.top - 10;
        let left = rect.left - editorRect.left + rect.width / 2;
        let isBelow = false;

        if (top < 100) {
          top = rect.bottom - editorRect.top + 10;
          isBelow = true;
        }

        const tooltipWidth = 300;
        if (left - tooltipWidth / 2 < 10) {
          left = tooltipWidth / 2 + 10;
        } else if (left + tooltipWidth / 2 > editorRect.width - 10) {
          left = editorRect.width - tooltipWidth / 2 - 10;
        }

        setTooltipPosition({ top, left, isBelow });
        setActiveTooltip(match);
      }
    };

    editorRef.current.addEventListener('click', handleEditorClick);
    return () => {
      editorRef.current?.removeEventListener('click', handleEditorClick);
    };
  }, [suggestions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const isColor = e.target.closest('[data-dropdown=\"color\"]');
      const isSpacing = e.target.closest('[data-dropdown=\"line-spacing\"]');
      const isTooltip = e.target.closest('[data-tooltip]');
      const isMark = e.target.tagName === 'MARK';

      if (!isColor) setShowColorPicker(false);
      if (!isSpacing) setShowLineSpacing(false);
      if (!isTooltip && !isMark) setActiveTooltip(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold">{t('appTitle')}</h1>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg transition-colors bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-yellow-400"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left panel (editor) */}
          <div className="rounded-xl shadow-lg p-6 relative bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t('yourText')}</h2>
              <div className="flex gap-2">
                <button onClick={copyText} className="px-3 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center gap-1">
                  <Copy className="w-4 h-4" />
                  {t('copy')}
                </button>
              </div>
            </div>

            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={updateContent}
              onPaste={handlePaste}
              onCopy={handleCopy}
              className="w-full h-96 p-4 rounded-lg border overflow-y-auto focus:outline-none bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                lineHeight: '1.5'
              }}
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {text.length} {t('characters')}
              </span>
              <button
                onClick={analyzeText}
                disabled={isAnalyzing || !text.trim()}
                className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2 ${
                  isAnalyzing || !text.trim()
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-lg'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('analyzing')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {t('analyzeText')}
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right panel (suggestions) */}
          <div className="rounded-xl shadow-lg p-6 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4">{t('suggestions')}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeCategory === category.id
                      ? `${category.color} text-white`
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                  {suggestions.filter(s => category.id === 'all' || s.category === category.id).length > 0 && (
                    <span className="ml-1">
                      ({suggestions.filter(s => category.id === 'all' || s.category === category.id).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredSuggestions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {suggestions.length === 0 ? t('clickAnalyzeText') : t('noSuggestionsCategory')}
                </div>
              ) : (
                filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(suggestion.category)}`}>
                          {suggestion.category}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => applySuggestion(suggestion)}
                          className="p-1 rounded hover:bg-green-500/20 text-green-500"
                          title={t('applySuggestion')}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => dismissSuggestion(suggestion)}
                          className="p-1 rounded hover:bg-red-500/20 text-red-500"
                          title={t('dismiss')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="line-through text-red-600 dark:text-red-400">{suggestion.issue}</span>
                        <span className="text-gray-400 dark:text-gray-500">→</span>
                        <span className="font-medium text-green-600 dark:text-green-400">{suggestion.suggestion}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.explanation}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextEditor;

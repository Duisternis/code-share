import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { FiShare2, FiDownload, FiSun, FiMoon, FiCopy, FiCode, FiSettings, FiCheck, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'rc-slider';
import { toast, ToastContainer } from 'react-toastify';
import 'rc-slider/assets/index.css';
import 'react-toastify/dist/ReactToastify.css';

import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";


const CodePlayground = () => {
  const [darkMode, setDarkMode] = useState(true);

  const [code, setCode] = useState('// Write your code here...\n// Ref. Code can be overriden, choose wisely\n\nfunction greet() {\n  console.log("Ref. Code in -> Share. Same code -> Load.");\n}\n\ngreet();\n');
  const [referenceCode, setReferenceCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(true);
  const editorContainerRef = useRef(null);
  const [editorHeight, setEditorHeight] = useState(500);


  console.log(import.meta.env.VITE_FIREBASE_API_KEY);

  useEffect(() => {
    const updateHeight = () => {
      if (editorContainerRef.current) {
        const height = editorContainerRef.current.clientHeight;
        setEditorHeight(height > 100 ? height : 500);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

 
  const toastTheme = {
    dark: {
      background: '#3C3836',
      text: '#D4BE98',
      progress: '#D8A657',
      icon: '#A9B665'
    },
    light: {
      background: '#EBDBB2',
      text: '#3C3836',
      progress: '#9D0006',
      icon: '#CC241D'
    }
  };

  const chocolateTheme = {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'D4BE98', background: '1D2021' },
      { token: 'keyword', foreground: 'D8A657' },
      { token: 'number', foreground: 'D3869B' },
      { token: 'string', foreground: 'A9B665' },
      { token: 'comment', foreground: '7C6F64' },
    ],
    colors: {
      'editor.background': '#1D2021',
      'editor.foreground': '#D4BE98',
      'editor.lineHighlightBackground': '#282828',
    }
  };

  const handleShare = async () => {
    if (!code.trim() || !referenceCode.trim()) {
      toast.error('Please enter code and a reference', {
        position: "bottom-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: darkMode ? 'dark' : 'light',
        style: {
          background: darkMode ? toastTheme.dark.background : toastTheme.light.background,
          color: darkMode ? toastTheme.dark.text : toastTheme.light.text,
        },
        progressStyle: {
          background: darkMode ? toastTheme.dark.progress : toastTheme.light.progress,
        }
      });
      return;
    }

    setIsLoading(true);

    const toastId = toast.loading('Sharing your code...', {
      position: "bottom-left",
      theme: darkMode ? 'dark' : 'light',
      style: {
        background: darkMode ? toastTheme.dark.background : toastTheme.light.background,
        color: darkMode ? toastTheme.dark.text : toastTheme.light.text,
      }
    });

    try {
      await setDoc(doc(db, "snippets", referenceCode), {
        code: code,
        createdAt: new Date()
      });

      setIsLoading(false);
      toast.update(toastId, {
        render: 'Code shared successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: <FiCheck className={darkMode ? 'text-[#A9B665]' : 'text-[#CC241D]'} />,
        style: {
          background: darkMode ? toastTheme.dark.background : toastTheme.light.background,
          color: darkMode ? toastTheme.dark.text : toastTheme.light.text,
        },
        progressStyle: {
          background: darkMode ? toastTheme.dark.progress : toastTheme.light.progress,
        }
      });
    } catch (error) {
      setIsLoading(false);
      toast.update(toastId, {
        render: 'Failed to share code!',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: darkMode ? toastTheme.dark.background : toastTheme.light.background,
          color: darkMode ? toastTheme.dark.text : toastTheme.light.text,
        },
        progressStyle: {
          background: darkMode ? toastTheme.dark.progress : toastTheme.light.progress,
        }
      });
    }
  };

  const handleLoad = async () => {
    if (!referenceCode.trim()) {
      toast.error('Please enter a reference code', {
        position: "bottom-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: darkMode ? 'dark' : 'light',
        style: {
          background: darkMode ? toastTheme.dark.background : toastTheme.light.background,
          color: darkMode ? toastTheme.dark.text : toastTheme.light.text,
        },
        progressStyle: {
          background: darkMode ? toastTheme.dark.progress : toastTheme.light.progress,
        }
      });
      return;
    }

    setIsLoading(true);
    
    const toastId = toast.loading('Loading code...', {
      position: "bottom-left",
      theme: darkMode ? 'dark' : 'light',
      style: {
        background: darkMode ? toastTheme.dark.background : toastTheme.light.background,
        color: darkMode ? toastTheme.dark.text : toastTheme.light.text,
      }
    });

    try {
      const docRef = doc(db, "snippets", referenceCode);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCode(docSnap.data().code);
        toast.update(toastId, {
          render: 'Code loaded successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
          icon: <FiCheck className={darkMode ? 'text-[#A9B665]' : 'text-[#CC241D]'} />,
          style: {
            background: darkMode ? toastTheme.dark.background : toastTheme.light.background,
            color: darkMode ? toastTheme.dark.text : toastTheme.light.text,
          }
        });
      } else {
        toast.update(toastId, {
          render: 'No code found for that reference!',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: `Error: ${error.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!code.trim()) {
      toast.error('No code to copy', {
        position: "bottom-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: darkMode ? 'dark' : 'light',
        style: {
          background: darkMode ? toastTheme.dark.background : toastTheme.light.background,
          color: darkMode ? toastTheme.dark.text : toastTheme.light.text,
        },
        progressStyle: {
          background: darkMode ? toastTheme.dark.progress : toastTheme.light.progress,
        }
      });
      return;
    }

    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!', {
      position: "bottom-left",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      icon: <FiCheck className={darkMode ? 'text-[#A9B665]' : 'text-[#CC241D]'} />,
      theme: darkMode ? 'dark' : 'light',
      style: {
        background: darkMode ? toastTheme.dark.background : toastTheme.light.background,
        color: darkMode ? toastTheme.dark.text : toastTheme.light.text,
      },
      progressStyle: {
        background: darkMode ? toastTheme.dark.progress : toastTheme.light.progress,
      }
    });
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#1D2021] text-[#D4BE98]' : 'bg-[#F9F5D7] text-[#3C3836]'}`}>
      <ToastContainer
        position="bottom-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? 'dark' : 'light'}
        toastStyle={{
          background: darkMode ? toastTheme.dark.background : toastTheme.light.background,
          color: darkMode ? toastTheme.dark.text : toastTheme.light.text,
        }}
        progressStyle={{
          background: darkMode ? toastTheme.dark.progress : toastTheme.light.progress,
        }}
      />

      <nav className="px-4 sm:px-6 py-4 border-b border-[#3C3836]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex items-center gap-3"
          >
            <FiCode className="w-5 h-5 sm:w-6 sm:h-6 text-[#D8A657]" />
            <h1 className="text-xl sm:text-2xl font-bold font-['Inter'] tracking-tight">
              Gimme<span className="text-[#D8A657]">That</span>
            </h1>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-[#3C3836] hover:bg-[#504945]' : 'bg-[#EBDBB2] hover:bg-[#D5C4A1]'}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FiSun className="w-4 h-4 sm:w-5 sm:h-5" /> : <FiMoon className="w-4 h-4 sm:w-5 sm:w-5" />}
          </motion.button>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden px-4 sm:px-6 py-4 sm:py-6 max-w-7xl w-full mx-auto">
        <div className="flex flex-col lg:flex-row flex-1 h-full gap-4 sm:gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 h-full flex flex-col min-h-[400px]"
            ref={editorContainerRef}
          >
            <div className="flex justify-between items-center mb-2 sm:mb-4">
              <h2 className="font-['Inter'] font-medium flex items-center gap-2 text-sm sm:text-base">
                <FiCode /> Editor
              </h2>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={copyToClipboard}
                disabled={!code.trim()}
                className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-['Inter'] text-xs sm:text-sm ${
                  darkMode
                    ? 'bg-[#3C3836] hover:bg-[#504945] text-[#D4BE98]'
                    : 'bg-[#EBDBB2] hover:bg-[#D5C4A1] text-[#3C3836]'
                } transition-colors`}
              >
                <FiCopy className="w-3 h-3 sm:w-4 sm:h-4" />
                {isCopied ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>

            <div className="flex-1 overflow-hidden rounded-lg border border-[#3C3836] shadow-lg">
              <Editor
                height={`${editorHeight - 60}px`}
                defaultLanguage="javascript"
                theme={darkMode ? 'chocolate' : 'light'}
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  automaticLayout: true,
                  fontSize: fontSize,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: wordWrap ? 'on' : 'off',
                  renderWhitespace: 'selection',
                  padding: { top: 20, bottom: 20 },
                }}
                beforeMount={(monaco) => {
                  monaco.editor.defineTheme('chocolate', chocolateTheme);
                }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="w-full lg:w-80 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <FiSettings className="w-4 h-4 sm:w-5 sm:h-5" />
              <h2 className="font-['Inter'] font-medium text-sm sm:text-base">Playground Controls</h2>
            </div>

            <div className={`p-4 sm:p-6 rounded-lg border ${darkMode ? 'bg-[#282828] border-[#3C3836]' : 'bg-[#EBDBB2] border-[#D5C4A1]'} shadow-lg flex-1 flex flex-col`}>
              <div className="mb-6">
                <h3 className="font-['Inter'] font-medium mb-3 text-sm sm:text-base">Editor Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center justify-between text-xs sm:text-sm mb-2">
                      <span>Font Size: {fontSize}px</span>
                    </label>
                    <Slider
                      min={10}
                      max={24}
                      value={fontSize}
                      onChange={(value) => setFontSize(value)}
                      trackStyle={{ backgroundColor: darkMode ? '#D8A657' : '#9D0006', height: 4 }}
                      handleStyle={{
                        backgroundColor: darkMode ? '#D4BE98' : '#F9F5D7',
                        borderColor: darkMode ? '#D8A657' : '#9D0006',
                        width: 16,
                        height: 16,
                        marginTop: -6,
                        opacity: 1,
                      }}
                      railStyle={{ backgroundColor: darkMode ? '#3C3836' : '#D5C4A1', height: 4 }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span>Word Wrap</span>
                    <button
                      onClick={() => setWordWrap(!wordWrap)}
                      className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                        wordWrap 
                          ? darkMode 
                            ? 'bg-[#D8A657]' 
                            : 'bg-[#9D0006]' 
                          : darkMode 
                            ? 'bg-[#3C3836]' 
                            : 'bg-[#D5C4A1]'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          wordWrap ? 'translate-x-4 sm:translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Reference Code Field (Shared for both operations) */}
              <div className="mb-4 sm:mb-6">
                <h3 className="font-['Inter'] font-medium mb-3 text-sm sm:text-base">Reference Code</h3>
                <input
                  type="text"
                  value={referenceCode}
                  onChange={(e) => setReferenceCode(e.target.value)}
                  placeholder="Enter reference code"
                  className={`w-full p-2 sm:p-3 rounded-lg font-['Inter'] text-xs sm:text-sm ${
                    darkMode ? 'bg-[#3C3836] border-[#504945]' : 'bg-[#F9F5D7] border-[#D5C4A1]'
                  } border focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-[#D8A657]' : 'focus:ring-[#9D0006]'}`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:gap-4 mt-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  disabled={!code.trim() || !referenceCode.trim() || isLoading}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium font-['Inter'] text-xs sm:text-sm ${
                    !code.trim() || !referenceCode.trim() || isLoading
                      ? darkMode
                        ? 'bg-[#3C3836] text-[#7C6F64] cursor-not-allowed'
                        : 'bg-[#EBDBB2] text-[#928374] cursor-not-allowed'
                      : darkMode
                        ? 'bg-[#D8A657] hover:bg-[#E78A4F] text-[#1D2021] shadow-md'
                        : 'bg-[#9D0006] hover:bg-[#CC241D] text-[#F9F5D7] shadow-md'
                  } transition-all`}
                >
                  {isLoading ? (
                    <motion.span
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Sharing...
                    </motion.span>
                  ) : (
                    <>
                      <FiShare2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      Share Code
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLoad}
                  disabled={!referenceCode.trim() || isLoading}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium font-['Inter'] text-xs sm:text-sm ${
                    !referenceCode.trim() || isLoading
                      ? darkMode
                        ? 'bg-[#3C3836] text-[#7C6F64] cursor-not-allowed'
                        : 'bg-[#EBDBB2] text-[#928374] cursor-not-allowed'
                      : darkMode
                        ? 'bg-[#7DAEA3] hover:bg-[#689D6A] text-[#1D2021] shadow-md'
                        : 'bg-[#458588] hover:bg-[#076678] text-[#F9F5D7] shadow-md'
                  } transition-all`}
                >
                  {isLoading ? (
                    <motion.span
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Loading...
                    </motion.span>
                  ) : (
                    <>
                      <FiDownload className="w-4 h-4 sm:w-5 sm:h-5" />
                      Load Code
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-4 border-t border-[#3C3836]">
        <div className="max-w-7xl mx-auto text-center font-['Inter'] text-xs sm:text-sm text-[#7C6F64]">
          <p>Proudly made in record time. Like, suspiciously fast.</p>
        </div>
      </footer>
    </div>
  );
};

export default CodePlayground;
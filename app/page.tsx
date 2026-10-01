"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import {
  Activity,
  AlertTriangle,
  BarChart2,
  BookOpen,
  Calendar,
  Copy,
  Edit,
  Filter,
  FolderPlus, GripVertical,
  Home as HomeIcon,
  Layers,
  Loader2,
  Lock,
  Lock as LockIcon,
  LogOut, Mail,
  Menu,
  Mic,
  Phone,
  Play,
  Plus, PlusCircle, Settings, Sparkles, Square, Trash2,
  Trophy,
  Unlock,
  UploadCloud,
  User,
  Volume2,
  X
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [authFullName, setAuthFullName] = useState("")
  const [authLoading, setAuthLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('home')

  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("") 
  const [editPassword, setEditPassword] = useState("")
  const [settingsLoading, setSettingsLoading] = useState(false)

  const [students, setStudents] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'age' | 'completed'>('newest')
  
  const [selectedStudentForStats, setSelectedStudentForStats] = useState<any>(null)
  const [statsFilter, setStatsFilter] = useState<'week' | 'month' | 'all'>('week')
  const [studentChartData, setStudentChartData] = useState<any[]>([])
  const [isChartLoading, setIsChartLoading] = useState(false)

  const [texts, setTexts] = useState<any[]>([])
  const [selectedText, setSelectedText] = useState<string>("")
  const [levels, setLevels] = useState<any[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string>("")
  const [challenges, setChallenges] = useState<any[]>([])
  
  // متغيرات ترتيب الجلسات
  const [showTextReorderModal, setShowTextReorderModal] = useState(false);
  const textDragItem = useRef<number | null>(null);
  const textDragOverItem = useRef<number | null>(null);

  const [editFullContent, setEditFullContent] = useState("")
  const [isTextUnlocked, setIsTextUnlocked] = useState(false) 
  const [textAudioFile, setTextAudioFile] = useState<File | null>(null)
  const loadedTextIdRef = useRef<string | null>(null)
  const textSaveBusyRef = useRef(false)
  const [textPreviewUrl, setTextPreviewUrl] = useState("")

  useEffect(() => {
    if (!textAudioFile) { setTextPreviewUrl(""); return; }
    const url = URL.createObjectURL(textAudioFile)
    setTextPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [textAudioFile])

  useEffect(() => {
    const warnBeforeRefresh = (event: BeforeUnloadEvent) => {
      if (!textAudioFile && !textMediaRecorderRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener('beforeunload', warnBeforeRefresh)
    return () => window.removeEventListener('beforeunload', warnBeforeRefresh)
  }, [textAudioFile])
  
  const [isSavingTextDetails, setIsSavingTextDetails] = useState(false)
  const [isRecordingText, setIsRecordingText] = useState(false)
  const textMediaRecorderRef = useRef<MediaRecorder | null>(null)
  const textAudioChunksRef = useRef<Blob[]>([])

  const [defaultAudios, setDefaultAudios] = useState<Record<string, string>>({})
  const [recordingDefaultType, setRecordingDefaultType] = useState<string | null>(null)
  const defaultMediaRecorderRef = useRef<MediaRecorder | null>(null)
  const defaultAudioChunksRef = useRef<Blob[]>([])

  // States for Lesson Pages
  const [lessonTitle, setLessonTitle] = useState("")
  const [lessonText, setLessonText] = useState("")
  const [lessonImage, setLessonImage] = useState<File | null>(null)
  const [lessonAudio, setLessonAudio] = useState<File | null>(null)

  const [readingSentence, setReadingSentence] = useState("")
  const [jumbleWords, setJumbleWords] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [matchWord, setMatchWord] = useState("")
  const [options, setOptions] = useState(["", "", ""])
  const [audioPairs, setAudioPairs] = useState<{word: string, file: File | null}[]>([{ word: "", file: null }, { word: "", file: null }])
  const [spellingWord, setSpellingWord] = useState("")
  const [spellingImage, setSpellingImage] = useState<File | null>(null)
  const [missingWord, setMissingWord] = useState("")
  const [correctLetter, setCorrectLetter] = useState("")
  const [missingOptions, setMissingOptions] = useState(["", "", ""])
  const [missingImage, setMissingImage] = useState<File | null>(null)
  const [huntTarget, setHuntTarget] = useState("")
  const [huntDistractors, setHuntDistractors] = useState("")
  
  const [syllableWord, setSyllableWord] = useState("")
  const [syllableParts, setSyllableParts] = useState("")
  const [matchSyllableText, setMatchSyllableText] = useState("")
  const [matchSyllableOptions, setMatchSyllableOptions] = useState(["", "", ""])
  const [matchSyllableCorrect, setMatchSyllableCorrect] = useState("")
  
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const [showSyncStudio, setShowSyncStudio] = useState(false)
  const [syncWords, setSyncWords] = useState<string[]>([])
  const [syncTimestamps, setSyncTimestamps] = useState<number[]>([])
  const [currentSyncIndex, setCurrentSyncIndex] = useState(0)
  const syncAudioRef = useRef<HTMLAudioElement | null>(null)

  const [dialogConfig, setDialogConfig] = useState<{isOpen: boolean, type: 'prompt' | 'confirm', title: string, message?: string, inputValue: string, onConfirm: (val: string) => void}>({
    isOpen: false, type: 'confirm', title: '', inputValue: '', onConfirm: () => {}
  });

  const challengeTypesList = [
    { id: 'lesson', label: '📖 صفحة تعليمية' },
    { id: 'reading', label: '🎙️ قراءة النص' },
    { id: 'jumble', label: '🧩 ترتيب جملة' },
    { id: 'match', label: '🖼️ صورة وكلمة' },
    { id: 'audio_match', label: '🎧 توصيل صوتي' },
    { id: 'spelling', label: '🔠 إملاء' },
    { id: 'missing_letter', label: '🔤 حرف ناقص' },
    { id: 'letter_hunt', label: '🎈 صيد الحروف' },
    { id: 'syllables', label: '✂️ ترتيب المقاطع' },
    { id: 'syllable_match', label: '🔍 التعرف على الكلمة' }
  ];

  useEffect(() => {
    const savedTab = localStorage.getItem('activeDashboardTab')
    if (savedTab) setActiveTab(savedTab)

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        setEditEmail(session.user.email || "")
        fetchProfile(session.user.id)
        loadDefaultAudios(session.user.id)
      } else {
        setIsInitializing(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        setEditEmail(session.user.email || "")
        fetchProfile(session.user.id)
        loadDefaultAudios(session.user.id)
      } else {
        setProfile(null)
        setTexts([])
        setStudents([])
        setEditName("")
        setEditEmail("")
        setAuthEmail("")
        setAuthPassword("")
        setActiveTab('home')
        localStorage.removeItem('activeDashboardTab')
        setIsInitializing(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadDefaultAudios = (userId: string) => {
    const saved = localStorage.getItem(`aamal_default_audios_${userId}`)
    if (saved) {
      try { setDefaultAudios(JSON.parse(saved)) } catch (e) {}
    }
  }

  const changeTab = (tab: string) => {
    setActiveTab(tab)
    localStorage.setItem('activeDashboardTab', tab)
  }

  useEffect(() => { 
    if (selectedText) { 
      fetchLevels(selectedText)
      const t = texts.find(x => x.id.toString() === selectedText)
      if (t && loadedTextIdRef.current !== selectedText) {
        loadedTextIdRef.current = selectedText
        setEditFullContent(t.full_content || "")
        setTextAudioFile(null) 
        setIsTextUnlocked(false) 
        setSyncTimestamps(t.sync_data || [])
      }
    } else {
      loadedTextIdRef.current = null
      setTextAudioFile(null)
      setLevels([]); 
      setSelectedLevel("");
      setEditFullContent("")
      setIsTextUnlocked(false)
      setSyncTimestamps([])
    } 
  }, [selectedText, texts])

  useEffect(() => { if (selectedLevel) { fetchChallenges(selectedLevel) } else { setChallenges([]) } }, [selectedLevel])

  useEffect(() => {
    if (selectedStudentForStats) {
      fetchStudentActivity(selectedStudentForStats.id, statsFilter)
    }
  }, [selectedStudentForStats, statsFilter])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      setProfile(data)
      setEditName(data.full_name || "")
      fetchTexts(userId, data.role)
      fetchStudentsData(data)
    }
    setIsInitializing(false)
  }

  const fetchStudentsData = async (userProfile?: any) => {
    if (!userProfile) return;
    try {
      setLoadingStudents(true);
      let query = supabase.from('profiles').select('*').eq('role', 'student');
      if (userProfile.role === 'teacher') {
        query = query.eq('linked_teacher_code', userProfile.teacher_code);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        const formattedStudents = data.map((student: Record<string, any>, index: number) => ({
          id: student.id,
          name: student.full_name || `طالب ${index + 1}`,
          currentLevel: student.current_level || 'المرحلة 1',
          errors: student.error_count || 0,
          age: student.age || 'غير محدد',
          phone: student.phone || 'غير محدد',
          completedChallenges: student.completed_challenges || 0,
          createdAt: new Date(student.created_at).getTime() || 0,
        }));
        setStudents(formattedStudents);
      }
    } catch (err: any) {
      console.log('❌ تفاصيل الخطأ:', err.message || err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
    if (sortBy === 'age') {
      const ageA = typeof a.age === 'number' ? a.age : 0;
      const ageB = typeof b.age === 'number' ? b.age : 0;
      return ageB - ageA; 
    }
    if (sortBy === 'completed') return b.completedChallenges - a.completedChallenges;
    if (sortBy === 'newest') return b.createdAt - a.createdAt;
    return 0;
  });

  const fetchStudentActivity = async (studentId: string, filter: 'week' | 'month' | 'all') => {
    setIsChartLoading(true);
    try {
      const { data, error } = await supabase.from('activity_logs').select('*').eq('student_id', studentId).order('created_at', { ascending: true });
      if (error) throw error;
      const logs = data || [];
      const now = new Date();
      let chartData: any[] = [];
      if (filter === 'week') {
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const map = new Map();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          map.set(days[d.getDay()], { name: days[d.getDay()], completed: 0, errors: 0 });
        }
        logs.forEach((log: any) => {
          const logDate = new Date(log.created_at);
          if ((now.getTime() - logDate.getTime()) <= 7 * 24 * 60 * 60 * 1000) {
            const dayName = days[logDate.getDay()];
            if (map.has(dayName)) {
              const entry = map.get(dayName);
              if (log.action_type === 'completed') entry.completed += 1;
              if (log.action_type === 'error') entry.errors += 1;
            }
          }
        });
        chartData = Array.from(map.values());
      } else if (filter === 'month') {
        chartData = [
          { name: 'الأسبوع الأول', completed: 0, errors: 0 },
          { name: 'الأسبوع الثاني', completed: 0, errors: 0 },
          { name: 'الأسبوع الثالث', completed: 0, errors: 0 },
          { name: 'الأسبوع الرابع', completed: 0, errors: 0 },
        ];
        logs.forEach((log: any) => {
          const logDate = new Date(log.created_at);
          const diffDays = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 3600 * 24));
          if (diffDays <= 30) {
            let weekIndex = 3;
            if (diffDays <= 7) weekIndex = 3;
            else if (diffDays <= 14) weekIndex = 2;
            else if (diffDays <= 21) weekIndex = 1;
            else weekIndex = 0; 
            if (log.action_type === 'completed') chartData[weekIndex].completed += 1;
            if (log.action_type === 'error') chartData[weekIndex].errors += 1;
          }
        });
      } else { 
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        const map = new Map();
        logs.forEach((log: any) => {
          const logDate = new Date(log.created_at);
          const monthName = months[logDate.getMonth()];
          const key = `${logDate.getFullYear()}-${logDate.getMonth()}`;
          if (!map.has(key)) {
            map.set(key, { name: monthName, completed: 0, errors: 0, timestamp: logDate.getTime() });
          }
          const entry = map.get(key);
          if (log.action_type === 'completed') entry.completed += 1;
          if (log.action_type === 'error') entry.errors += 1;
        });
        chartData = Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
      }
      setStudentChartData(chartData);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsChartLoading(false);
    }
  };

  const fetchTexts = async (userId: string, role: string) => {
    let query = supabase.from('texts').select('*').order('order_index', { ascending: true }).order('id', { ascending: true });
    if (role !== 'super_admin') {
      query = query.eq('teacher_id', userId);
    }
    const { data } = await query;
    if (data) {
      setTexts(data);
      const savedTextId = localStorage.getItem('aamal_selected_text');
      if (savedTextId && data.find(t => t.id.toString() === savedTextId)) {
        setSelectedText(savedTextId);
      } else if (data.length > 0 && !selectedText) {
        setSelectedText(data[0].id.toString());
      }
    }
  }

  const fetchLevels = async (textId: string) => {
    const { data } = await supabase.from('levels').select('*').eq('text_id', textId).order('id')
    if (data) {
      setLevels(data);
      const savedLevelId = localStorage.getItem('aamal_selected_level');
      if (savedLevelId && data.find(l => l.id.toString() === savedLevelId)) {
        setSelectedLevel(savedLevelId);
      } else if (data.length > 0) {
        setSelectedLevel(data[0].id.toString());
      } else {
        setSelectedLevel("");
      }
    }
  }

  const fetchChallenges = async (levelId: string) => {
    const { data } = await supabase.from('challenges').select('*').eq('level_id', levelId).order('order_index', { ascending: true }).order('id', { ascending: true })
    if (data) setChallenges(data)
  }

  const handleTextSort = async () => {
    if (textDragItem.current === null || textDragOverItem.current === null) return;
    const copyTexts = [...texts];
    const draggedContent = copyTexts.splice(textDragItem.current, 1)[0];
    copyTexts.splice(textDragOverItem.current, 0, draggedContent);
    textDragItem.current = null;
    textDragOverItem.current = null;
    setTexts(copyTexts);

    copyTexts.forEach(async (text, index) => {
      await supabase.from('texts').update({ order_index: index }).eq('id', text.id);
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    if (isLoginMode) {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
      if (error) alert("❌ خطأ في تسجيل الدخول: " + error.message)
    } else {
      if (!authFullName.trim()) { alert("الرجاء إدخال الاسم الكامل"); setAuthLoading(false); return; }
      const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword })
      if (error) { alert("❌ خطأ في إنشاء الحساب: " + error.message) } 
      else if (data.user) {
        const code = 'TCH-' + Math.random().toString(36).substring(2, 6).toUpperCase()
        await supabase.from('profiles').insert([{ id: data.user.id, role: 'teacher', full_name: authFullName, teacher_code: code }])
        alert("✅ تم إنشاء الحساب بنجاح!")
        await fetchProfile(data.user.id)
      }
    }
    setAuthLoading(false)
  }

  const handleSignOut = async () => {
    setProfile(null)
    setEditName("")
    setActiveTab('home')
    localStorage.removeItem('activeDashboardTab')
    setAuthEmail("")
    setAuthPassword("")
    setAuthFullName("")
    await supabase.auth.signOut() 
  }

  const copyTeacherCode = () => {
    if (profile?.teacher_code) {
      navigator.clipboard.writeText(profile.teacher_code)
      alert("تم نسخ كود المعلم! شاركه مع طلابك.")
    }
  }

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsLoading(true)
    try {
      let isUpdated = false;
      if (editName.trim() && editName !== profile.full_name) {
        const { error } = await supabase.from('profiles').update({ full_name: editName }).eq('id', session.user.id)
        if (error) throw error
        setProfile({ ...profile, full_name: editName })
        isUpdated = true;
      }
      if (editEmail.trim() && editEmail !== session.user.email) {
        const { error } = await supabase.auth.updateUser({ email: editEmail.trim() })
        if (error) throw error
        alert("✉️ تم طلب تغيير الإيميل! يرجى تفقد صندوق الوارد للإيميل الجديد والقديم لتأكيد التغيير.")
        isUpdated = true;
      }
      if (editPassword) {
        if (editPassword.length < 6) { alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); setSettingsLoading(false); return; }
        const { error } = await supabase.auth.updateUser({ password: editPassword })
        if (error) throw error
        setEditPassword("")
        alert("✅ تم تحديث كلمة المرور بنجاح!")
        isUpdated = true;
      }
      if (isUpdated && editEmail === session.user.email) {
         alert("✅ تم حفظ إعدادات الحساب بنجاح!")
      }
    } catch (err: any) { alert("❌ حدث خطأ: " + err.message) }
    setSettingsLoading(false)
  }

  const handleDeleteAccount = async () => {
    setDialogConfig({
      isOpen: true,
      type: 'confirm',
      title: 'حذف الحساب نهائياً',
      message: '⚠️ تحذير خطير: هل أنت متأكد من حذف حسابك بشكل نهائي؟ سيتم مسح نصوصك وبياناتك بالكامل ولا يمكن التراجع.',
      inputValue: '',
      onConfirm: async () => {
        try {
          setSettingsLoading(true);
          await supabase.from('texts').delete().eq('teacher_id', session.user.id);
          await supabase.from('profiles').delete().eq('id', session.user.id);
          alert("تم حذف الحساب بنجاح. نتمنى لك التوفيق!");
          await handleSignOut();
        } catch (e: any) {
          alert("❌ حدث خطأ أثناء الحذف: " + e.message);
        } finally {
          setSettingsLoading(false);
          setDialogConfig({ ...dialogConfig, isOpen: false });
        }
      }
    });
  }

  const handleAddNewText = async () => {
    if (!session || !profile) return;
    const newTextName = `النص ${texts.length + 1}`
    const tId = profile.role === 'super_admin' ? null : session.user.id;
    const newOrder = texts.length > 0 ? Math.max(...texts.map(t => t.order_index || 0)) + 1 : 0;
    const { data } = await supabase.from('texts').insert([{ name: newTextName, teacher_id: tId, order_index: newOrder }]).select()
    if (data) { setTexts([...texts, data[0]]); setSelectedText(data[0].id.toString()) }
  }

  const handleRenameText = () => {
    if (!selectedText) return
    const currentText = texts.find(t => t.id.toString() === selectedText)
    if (!currentText) return
    setDialogConfig({
      isOpen: true,
      type: 'prompt',
      title: 'إعادة تسمية النص',
      message: 'أدخل الاسم الجديد للنص:',
      inputValue: currentText.name,
      onConfirm: async (newName) => {
        if (!newName || newName.trim() === "" || newName === currentText.name) {
          setDialogConfig({ ...dialogConfig, isOpen: false });
          return;
        }
        const { error } = await supabase.from('texts').update({ name: newName.trim() }).eq('id', selectedText)
        if (!error) setTexts(texts.map(t => t.id.toString() === selectedText ? { ...t, name: newName.trim() } : t))
        setDialogConfig({ ...dialogConfig, isOpen: false });
      }
    });
  }

  const handleDeleteText = () => {
    if (!selectedText) return
    setDialogConfig({
      isOpen: true,
      type: 'confirm',
      title: 'حذف النص',
      message: 'هل أنت متأكد من حذف هذا النص؟ سيتم حذف جميع المراحل والتحديات التابعة له!',
      inputValue: '',
      onConfirm: async () => {
        const { error } = await supabase.from('texts').delete().eq('id', selectedText)
        if (!error) {
          const updated = texts.filter(t => t.id.toString() !== selectedText)
          setTexts(updated)
          if (updated.length > 0) {
             setSelectedText(updated[0].id.toString());
             localStorage.setItem('aamal_selected_text', updated[0].id.toString());
          } else {
             setSelectedText("");
             localStorage.removeItem('aamal_selected_text');
          }
        }
        setDialogConfig({ ...dialogConfig, isOpen: false });
      }
    });
  }

  const startRecordingText = async () => {
    if (isSavingTextDetails || textMediaRecorderRef.current) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("⚠️ متصفحك لا يدعم التسجيل."); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      textMediaRecorderRef.current = mediaRecorder
      textAudioChunksRef.current = []
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) textAudioChunksRef.current.push(event.data) }
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(textAudioChunksRef.current, { type: mediaRecorder.mimeType || textAudioChunksRef.current[0]?.type || "audio/webm" }) 
        const fileExt = audioBlob.type.includes('mp4') ? 'm4a' : audioBlob.type.includes('ogg') ? 'ogg' : audioBlob.type.includes('wav') ? 'wav' : 'webm'
        const audioFile = new File([audioBlob], `text_audio_${Date.now()}.${fileExt}`, { type: audioBlob.type })
        if (audioFile.size > 0) setTextAudioFile(audioFile)
        else alert("التسجيل فارغ. يرجى المحاولة مرة أخرى.")
        stream.getTracks().forEach(track => track.stop())
        textMediaRecorderRef.current = null
        setIsRecordingText(false)
      }
      mediaRecorder.start()
      setIsRecordingText(true)
    } catch (err: any) { alert("❌ فشل الوصول للمايكروفون.") }
  }

  const stopRecordingText = () => {
    if (textMediaRecorderRef.current && textMediaRecorderRef.current.state !== 'inactive') {
      textMediaRecorderRef.current.stop()
    }
  }

  const openSyncStudio = () => {
    if (!editFullContent.trim()) {
      alert("الرجاء كتابة النص بالكامل قبل مزامنة الصوت.");
      return;
    }
    const currentTextObj = texts.find(t => t.id.toString() === selectedText);
    const hasAudio = textAudioFile || currentTextObj?.audio_url;
    if (!hasAudio) {
      alert("الرجاء تسجيل أو رفع ملف صوتي للقصة لتتمكن من المزامنة.");
      return;
    }

    const words = editFullContent.split(/\s+/).filter(w => w.length > 0);
    setSyncWords(words);
    
    if (syncTimestamps.length !== words.length) {
      setSyncTimestamps(new Array(words.length).fill(null));
      setCurrentSyncIndex(0);
    } else {
      const lastSynced = syncTimestamps.findLastIndex(t => t !== null);
      setCurrentSyncIndex(lastSynced === -1 ? 0 : lastSynced + 1);
    }
    setShowSyncStudio(true);
  }

  const handleCaptureSync = () => {
    if (!syncAudioRef.current) return;
    if (currentSyncIndex < syncWords.length) {
      const time = syncAudioRef.current.currentTime;
      const newTimestamps = [...syncTimestamps];
      newTimestamps[currentSyncIndex] = time;
      setSyncTimestamps(newTimestamps);
      setCurrentSyncIndex(prev => prev + 1);
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSyncStudio && e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        handleCaptureSync();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSyncStudio, currentSyncIndex, syncWords, syncTimestamps]);

  const saveTextDetails = async () => {
    if (!selectedText || textSaveBusyRef.current) return;
    if (textMediaRecorderRef.current || isRecordingText) {
      alert("أوقف التسجيل وانتظر حتى يصبح جاهزًا قبل الحفظ."); return;
    }
    const targetTextId = selectedText;
    const pendingAudio = textAudioFile;
    textSaveBusyRef.current = true;
    setIsSavingTextDetails(true);
    try {
      let uploadedAudioUrl: string | null = null;
      if (pendingAudio) {
        if (!pendingAudio.size) throw new Error("التسجيل فارغ. أعد التسجيل.");
        const fileExt = pendingAudio.name.split('.').pop();
        const safeFileName = `text_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('audios').upload(safeFileName, pendingAudio, {
          contentType: pendingAudio.type || 'application/octet-stream',
          upsert: false,
        });
        if (uploadError) throw new Error("تعذر رفع التسجيل: " + uploadError.message);
        uploadedAudioUrl = supabase.storage.from('audios').getPublicUrl(safeFileName).data.publicUrl;
      }
      const updateData: any = { full_content: editFullContent };
      if (uploadedAudioUrl) updateData.audio_url = uploadedAudioUrl;
      if (syncTimestamps.length > 0) updateData.sync_data = syncTimestamps;

      const { data: savedText, error } = await supabase.from('texts')
        .update(updateData).eq('id', targetTextId).select('*').single();
      if (error) throw new Error("تعذر تأكيد حفظ النص والتسجيل: " + error.message);
      if (!savedText || String(savedText.id) !== targetTextId ||
          (uploadedAudioUrl && savedText.audio_url !== uploadedAudioUrl)) {
        throw new Error("لم يتم تأكيد ربط التسجيل بالنص. التسجيل المؤقت ما زال متاحًا لإعادة الحفظ.");
      }
      setTexts(previous => previous.map(t => String(t.id) === targetTextId ? savedText : t));
      setTextAudioFile(null);
      setIsTextUnlocked(false);
      alert(uploadedAudioUrl ? "✅ تم حفظ النص وربط التسجيل به بنجاح!" : "✅ تم حفظ النص بنجاح.");
    } catch (err: any) {
      alert("❌ " + (err?.message || "تعذر الحفظ. حاول مرة أخرى."));
    } finally {
      textSaveBusyRef.current = false;
      setIsSavingTextDetails(false);
    }
  }

  const startRecordingDefault = async (type: string) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("⚠️ متصفحك لا يدعم التسجيل."); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      defaultMediaRecorderRef.current = mediaRecorder
      defaultAudioChunksRef.current = []
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) defaultAudioChunksRef.current.push(event.data) }
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(defaultAudioChunksRef.current, { type: mediaRecorder.mimeType || defaultAudioChunksRef.current[0]?.type || "audio/webm" }) 
        const fileExt = audioBlob.type.includes('mp4') ? 'm4a' : audioBlob.type.includes('ogg') ? 'ogg' : audioBlob.type.includes('wav') ? 'wav' : 'webm'
        const audioFile = new File([audioBlob], `default_${type}.${fileExt}`, { type: audioBlob.type })
        await uploadDefaultAudio(type, audioFile)
        stream.getTracks().forEach(track => track.stop())
      }
      mediaRecorder.start()
      setRecordingDefaultType(type)
    } catch (err: any) { alert("❌ فشل الوصول للمايكروفون.") }
  }

  const stopRecordingDefault = () => {
    if (defaultMediaRecorderRef.current && defaultMediaRecorderRef.current.state !== 'inactive') {
      defaultMediaRecorderRef.current.stop(); setRecordingDefaultType(null)
    }
  }

  const uploadDefaultAudio = async (type: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `defaults/${session.user.id}_${type}.${fileExt}`
      const { error } = await supabase.storage.from('audios').upload(fileName, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('audios').getPublicUrl(fileName)
      
      const newUrl = data.publicUrl + '?t=' + Date.now() 
      const newDefaults = { ...defaultAudios, [type]: newUrl }
      setDefaultAudios(newDefaults)
      localStorage.setItem(`aamal_default_audios_${session.user.id}`, JSON.stringify(newDefaults))
      alert("✅ تم حفظ الصوت الافتراضي بنجاح!")
    } catch (e: any) {
      alert("❌ خطأ في رفع الصوت: " + e.message)
    }
  }

  const handleSort = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const copyChallenges = [...challenges];
    const draggedContent = copyChallenges.splice(dragItem.current, 1)[0];
    copyChallenges.splice(dragOverItem.current, 0, draggedContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setChallenges(copyChallenges);

    copyChallenges.forEach(async (challenge, index) => {
      await supabase.from('challenges').update({ order_index: index }).eq('id', challenge.id);
    });
  };

  const handleAddNewLevel = async () => {
    if (!selectedText) return
    const newLevelName = `المرحلة ${levels.length + 1}`
    const { data } = await supabase.from('levels').insert([{ name: newLevelName, text_id: selectedText }]).select()
    if (data) { setLevels([...levels, data[0]]); setSelectedLevel(data[0].id.toString()) }
  }

  const handleRenameLevel = () => {
    if (!selectedLevel) return
    const currentLevelObj = levels.find(l => l.id.toString() === selectedLevel)
    if (!currentLevelObj) return
    setDialogConfig({
      isOpen: true,
      type: 'prompt',
      title: 'إعادة تسمية المرحلة',
      message: 'أدخل الاسم الجديد للمرحلة:',
      inputValue: currentLevelObj.name,
      onConfirm: async (newName) => {
        if (!newName || newName.trim() === "" || newName === currentLevelObj.name) {
          setDialogConfig({ ...dialogConfig, isOpen: false });
          return;
        }
        const { error } = await supabase.from('levels').update({ name: newName.trim() }).eq('id', selectedLevel)
        if (!error) setLevels(levels.map(l => l.id.toString() === selectedLevel ? { ...l, name: newName.trim() } : l))
        setDialogConfig({ ...dialogConfig, isOpen: false });
      }
    });
  }

  const handleDeleteLevel = () => {
    if (!selectedLevel) return
    setDialogConfig({
      isOpen: true,
      type: 'confirm',
      title: 'حذف المرحلة',
      message: 'هل أنت متأكد من حذف هذه المرحلة؟',
      inputValue: '',
      onConfirm: async () => {
        const { error } = await supabase.from('levels').delete().eq('id', selectedLevel)
        if (!error) {
          const updated = levels.filter(l => l.id.toString() !== selectedLevel)
          setLevels(updated)
          setSelectedLevel(updated.length > 0 ? updated[0].id.toString() : "")
        }
        setDialogConfig({ ...dialogConfig, isOpen: false });
      }
    });
  }

  const startRecording = async (index: number) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { alert("⚠️ متصفحك لا يدعم التسجيل."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || audioChunksRef.current[0]?.type || "audio/webm" });
        const fileExt = audioBlob.type.includes('mp4') ? 'm4a' : audioBlob.type.includes('ogg') ? 'ogg' : audioBlob.type.includes('wav') ? 'wav' : 'webm';
        const audioFile = new File([audioBlob], `audio_${Date.now()}.${fileExt}`, { type: audioBlob.type });
        const newPairs = [...audioPairs];
        newPairs[index].file = audioFile;
        setAudioPairs(newPairs);
        stream.getTracks().forEach(track => track.stop());
        setRecordingIndex(null);
      };
      mediaRecorder.start();
      setRecordingIndex(index);
    } catch (err: any) { alert("❌ فشل الوصول للمايكروفون."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const addAudioPair = () => { setAudioPairs([...audioPairs, { word: "", file: null }]) };

  const removeAudioPair = (index: number) => {
    const newPairs = [...audioPairs];
    newPairs.splice(index, 1);
    setAudioPairs(newPairs);
  };

  const clearAudioFile = (index: number) => {
    const newPairs = [...audioPairs];
    newPairs[index].file = null;
    setAudioPairs(newPairs);
  };

  const handleAddChallenge = async (type: string) => {
    if (!selectedLevel) { alert("الرجاء اختيار المرحلة أولاً"); return; }
    setIsUploading(true);
    try {
      let contentObj: any = {};

      const uploadFile = async (file: File, bucket: string) => {
        const fileExt = file.name.split('.').pop();
        const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const { error } = await supabase.storage.from(bucket).upload(safeFileName, file);
        if (error) throw error;
        const { data } = supabase.storage.from(bucket).getPublicUrl(safeFileName);
        return data.publicUrl;
      };

      if (type === 'lesson') {
        if (!lessonText && !lessonImage && !lessonAudio) throw new Error("يجب إدخال نص، صورة، أو صوت على الأقل");
        let imageUrl = null;
        let customAudioUrl = null;
        if (lessonImage) imageUrl = await uploadFile(lessonImage, 'images');
        if (lessonAudio) customAudioUrl = await uploadFile(lessonAudio, 'audios');
        
        contentObj = { title: lessonTitle, text: lessonText, image_url: imageUrl };
        if (customAudioUrl) {
           contentObj.instruction_audio = customAudioUrl;
        }
      } else if (type === 'reading') {
        if (!readingSentence) throw new Error("أدخل الجملة");
        contentObj = { sentence: readingSentence };
      } else if (type === 'jumble') {
        if (!jumbleWords) throw new Error("أدخل الكلمات");
        contentObj = { words: jumbleWords.split(',').map(w => w.trim()) };
      } else if (type === 'match') {
        if (!matchWord || !imageFile) throw new Error("أدخل الكلمة وارفع الصورة");
        const imageUrl = await uploadFile(imageFile, 'images');
        contentObj = { word: matchWord, options, image_url: imageUrl };
      } else if (type === 'audio_match') {
        let pairsData = [];
        for (let i=0; i<audioPairs.length; i++) {
          if (audioPairs[i].word && audioPairs[i].file) {
            const audioUrl = await uploadFile(audioPairs[i].file!, 'audios');
            pairsData.push({ word: audioPairs[i].word, audio_url: audioUrl });
          }
        }
        if (pairsData.length < 2) throw new Error("أدخل على الأقل كلمتين مع الصوت");
        contentObj = { pairs: pairsData };
      } else if (type === 'spelling') {
        if (!spellingWord || !spellingImage) throw new Error("أدخل الكلمة وارفع الصورة");
        const imageUrl = await uploadFile(spellingImage, 'images');
        contentObj = { word: spellingWord, image_url: imageUrl };
      } else if (type === 'missing_letter') {
        if (!missingWord || !correctLetter || !missingImage) throw new Error("أكمل بيانات التحدي");
        const imageUrl = await uploadFile(missingImage, 'images');
        contentObj = { word: missingWord, options: missingOptions, correct_letter: correctLetter, image_url: imageUrl };
      } else if (type === 'letter_hunt') {
        if (!huntTarget || !huntDistractors) throw new Error("أدخل الحرف الهدف والمشتتات");
        contentObj = { target: huntTarget, distractors: huntDistractors.split(',').map(w => w.trim()) };
      } 
      else if (type === 'syllables') {
        if (!syllableWord || !syllableParts) throw new Error("أدخل الكلمة ومقاطعها");
        contentObj = { word: syllableWord, syllables: syllableParts.split(',').map(w => w.trim()) };
      }
      else if (type === 'syllable_match') {
        if (!matchSyllableText || !matchSyllableCorrect) throw new Error("أدخل المقاطع والكلمة الصحيحة");
        contentObj = { syllables_text: matchSyllableText, options: matchSyllableOptions, correct: matchSyllableCorrect };
      }

      // إضافة الصوت الافتراضي إذا لم يكن هناك صوت مخصص في الصفحة التعليمية أو كان نوع آخر
      if (defaultAudios[type] && !contentObj.instruction_audio) {
        contentObj.instruction_audio = defaultAudios[type];
      }

      const newOrder = challenges.length > 0 ? Math.max(...challenges.map(c => c.order_index || 0)) + 1 : 1;

      const { error } = await supabase.from('challenges').insert([{
        level_id: selectedLevel,
        challenge_type: type,
        content: JSON.stringify(contentObj),
        order_index: newOrder
      }]);

      if (error) throw error;

      alert("✅ تم الإضافة بنجاح!");
      fetchChallenges(selectedLevel);

      // تفريغ الحقول
      setLessonTitle(""); setLessonText(""); setLessonImage(null); setLessonAudio(null);
      setReadingSentence(""); setJumbleWords(""); setImageFile(null); setMatchWord("");
      setOptions(["", "", ""]); setSpellingWord(""); setSpellingImage(null); setMissingWord("");
      setCorrectLetter(""); setMissingOptions(["", "", ""]); setMissingImage(null);
      setHuntTarget(""); setHuntDistractors("");
      setSyllableWord(""); setSyllableParts(""); setMatchSyllableText(""); setMatchSyllableOptions(["", "", ""]); setMatchSyllableCorrect("");
      setAudioPairs([{ word: "", file: null }, { word: "", file: null }]);

    } catch (err: any) {
      alert("❌ خطأ: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteChallenge = async (id: number) => { 
    await supabase.from('challenges').delete().eq('id', id); 
    fetchChallenges(selectedLevel); 
  }

  const getChallengeTypeName = (type: string) => {
    const found = challengeTypesList.find(t => t.id === type);
    return found ? found.label : type;
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#111b21] flex flex-col items-center justify-center p-4" dir="rtl">
        <Loader2 className="h-14 w-14 animate-spin text-[#00a884] mb-4" />
        <h2 className="text-[#8696a0] font-bold text-xl">جاري الاتصال بالمنصة...</h2>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#111b21] flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md bg-[#202c33] border-none shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <CardHeader className="bg-[#182b28] border-b border-[#00a884]/30 pb-6 text-center space-y-4 pt-8">
            <div className="bg-[#00a884] p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(0,168,132,0.5)]">
              <Sparkles className="h-10 w-10 text-[#111b21]" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">منصة آمال التعليمية</CardTitle>
            <p className="text-[#8696a0]">بوابة الإدارة والمعلمين</p>
          </CardHeader>
          <CardContent className="pt-8 space-y-6 px-8 pb-8">
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLoginMode && (
                <div className="space-y-2">
                  <Label className="text-[#8696a0] font-bold">الاسم الكامل</Label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8696a0] h-5 w-5" />
                    <Input required value={authFullName} onChange={(e) => setAuthFullName(e.target.value)} placeholder="مثال: أحمد خالد" className="pl-4 pr-12 text-right bg-[#111b21] border-[#2f3b43] text-white h-14 rounded-xl focus-visible:ring-0 focus-visible:border-[#00a884]" />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-[#8696a0] font-bold">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8696a0] h-5 w-5" />
                  <Input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="name@domain.com" className="pl-4 pr-12 text-left bg-[#111b21] border-[#2f3b43] text-white h-14 rounded-xl focus-visible:ring-0 focus-visible:border-[#00a884]" dir="ltr" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[#8696a0] font-bold">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8696a0] h-5 w-5" />
                  <Input type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" className="pl-4 pr-12 text-left bg-[#111b21] border-[#2f3b43] text-white h-14 rounded-xl focus-visible:ring-0 focus-visible:border-[#00a884]" dir="ltr" />
                </div>
              </div>
              <Button disabled={authLoading} type="submit" className="w-full bg-[#00a884] hover:bg-[#00cf9f] text-[#111b21] font-bold h-14 text-lg rounded-xl mt-4">
                {authLoading ? "جاري التحميل..." : (isLoginMode ? "تسجيل الدخول" : "إنشاء الحساب")}
              </Button>
            </form>
            <div className="text-center pt-2 border-t border-[#2f3b43]">
              <p className="text-[#8696a0]">
                {isLoginMode ? "ليس لديك حساب؟ " : "لديك حساب بالفعل؟ "}
                <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-[#00a884] font-bold hover:underline">
                  {isLoginMode ? "إنشاء حساب جديد" : "تسجيل الدخول"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentTextObjForSync = texts.find(t => t.id.toString() === selectedText);
  const syncAudioSrc = textAudioFile ? textPreviewUrl : currentTextObjForSync?.audio_url;

  return (
    <div className="flex h-screen bg-[#111b21] text-white font-sans dir-rtl selection:bg-[#00a884] selection:text-[#111b21]">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-[#202c33] border-l border-[#2f3b43] flex flex-col z-20`}>
        <div className="p-4 flex items-center justify-between border-b border-[#2f3b43]">
          <h1 className="text-2xl font-bold text-[#00a884] whitespace-nowrap">منصة آمال</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-[#8696a0] hover:text-white">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => changeTab('home')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-[#00a884] text-[#111b21] font-bold' : 'text-[#8696a0] hover:bg-[#2a3942] hover:text-white'}`}><HomeIcon size={20} /><span>الصفحة الرئيسية</span></button>
          <button onClick={() => changeTab('progress')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === 'progress' ? 'bg-[#00a884] text-[#111b21] font-bold' : 'text-[#8696a0] hover:bg-[#2a3942] hover:text-white'}`}><BarChart2 size={20} /><span>إحصائيات الطلاب</span></button>
          <button onClick={() => changeTab('audios')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === 'audios' ? 'bg-[#00a884] text-[#111b21] font-bold' : 'text-[#8696a0] hover:bg-[#2a3942] hover:text-white'}`}><Volume2 size={20} /><span>أصوات التعليمات</span></button>
          <button onClick={() => changeTab('settings')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-[#00a884] text-[#111b21] font-bold' : 'text-[#8696a0] hover:bg-[#2a3942] hover:text-white'}`}><Settings size={20} /><span>الإعدادات</span></button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-[#202c33] border-b border-[#2f3b43] flex items-center px-4 justify-between z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-[#2a3942] rounded-lg text-[#8696a0] hover:text-white transition-colors"><Menu size={24} /></button>
            <div className="font-bold text-white text-lg">
              {activeTab === 'home' && 'إدارة النصوص والتحديات'}
              {activeTab === 'progress' && 'متابعة أداء الطلاب'}
              {activeTab === 'audios' && 'إعدادات الأصوات الافتراضية'}
              {activeTab === 'settings' && 'إعدادات الحساب'}
            </div>
          </div>
          {profile?.role === 'teacher' && profile?.teacher_code && (
            <div className="hidden md:flex items-center gap-3 bg-[#182b28] border border-[#00a884]/30 px-3 py-1 rounded-xl">
              <span className="text-xs text-[#00a884] font-bold">كود المعلم:</span>
              <span className="font-black tracking-widest">{profile.teacher_code}</span>
              <Button onClick={copyTeacherCode} variant="ghost" className="h-8 w-8 p-0 text-[#00a884] hover:bg-[#00a884]/20 rounded-lg"><Copy className="h-4 w-4" /></Button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-[#111b21]">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'home' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-[#202c33] border-none shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-[#2a3942] border-b border-[#2f3b43] pb-4">
                      <CardTitle className="text-xl text-white flex items-center gap-2"><BookOpen className="text-[#00a884]" /> إدارة النصوص</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <Label className="text-[#8696a0] font-bold text-base">اختر النص الدراسي:</Label>
                      <Select value={selectedText} disabled={isSavingTextDetails || isRecordingText} onValueChange={(value) => {
                        if (textAudioFile && !window.confirm("يوجد تسجيل غير محفوظ. هل تريد تجاهله والانتقال لنص آخر؟")) return;
                        setSelectedText(value);
                        localStorage.setItem('aamal_selected_text', value); 
                        localStorage.removeItem('aamal_selected_level');
                      }}>
                        <SelectTrigger className="w-full h-14 text-lg bg-[#111b21] border-[#2f3b43] text-white rounded-xl focus:ring-[#00a884]" dir="rtl">
                          <SelectValue placeholder="اختر النص" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#202c33] border-[#2f3b43] text-white" dir="rtl">
                          {texts.map((text) => (
                            <SelectItem className="focus:bg-[#2a3942] focus:text-[#00a884] text-lg cursor-pointer" key={text.id} value={text.id.toString()}>
                              {text.name} {profile?.role === 'super_admin' && (text.teacher_id ? '(لمعلم)' : '(عام)')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-3 pt-2">
                        <Button onClick={handleAddNewText} className="flex-1 h-12 bg-[#00a884] hover:bg-[#00cf9f] text-[#111b21] font-bold rounded-xl"><PlusCircle className="ml-2 h-5 w-5" /> إضافة نص</Button>
                        <Button onClick={() => setShowTextReorderModal(true)} variant="outline" className="h-12 bg-transparent border-[#2f3b43] text-white hover:bg-[#2a3942] rounded-xl px-4"><GripVertical className="ml-2 h-5 w-5" /> ترتيب</Button>
                        {selectedText && (
                          <>
                            <Button onClick={handleRenameText} variant="outline" className="h-12 bg-transparent border-[#2f3b43] text-white hover:bg-[#2a3942] rounded-xl"><Edit className="h-5 w-5" /></Button>
                            <Button onClick={handleDeleteText} variant="outline" className="h-12 bg-transparent border-[#f44336] text-[#f44336] hover:bg-[#3b1c1c] rounded-xl"><Trash2 className="h-5 w-5" /></Button>
                          </>
                        )}
                      </div>

                      {selectedText && (
                        <div className="pt-6 mt-6 border-t border-[#2f3b43] space-y-6 animate-in fade-in">
                          <div className="space-y-3">
                            <Label className="text-[#8696a0] font-bold flex items-center justify-between">
                              <span className="flex items-center gap-2"><BookOpen size={18} className="text-[#00a884]" /> محتوى القصة / النص الكامل:</span>
                            </Label>
                            <Textarea 
                              value={editFullContent} 
                              onChange={(e: any) => setEditFullContent(e.target.value)} 
                              readOnly={!isTextUnlocked || isSavingTextDetails}
                              placeholder="اكتب قصة أو نص هذه الجلسة هنا ليتمكن الطالب من قراءتها قبل بدء التحديات..." 
                              className={`min-h-[120px] text-right bg-[#111b21] border-[#2f3b43] text-white text-lg rounded-xl focus-visible:ring-0 focus-visible:border-[#00a884] resize-y ${!isTextUnlocked ? 'opacity-70 cursor-not-allowed select-none' : ''}`} 
                            />
                          </div>

                          <fieldset disabled={isSavingTextDetails} className="space-y-3">
                            <Label className="text-[#8696a0] font-bold flex items-center gap-2">
                              <Mic size={18} className="text-[#00a884]" /> أضف التسجيل الصوتي للقصة (اختياري):
                            </Label>
                            
                            <Tabs defaultValue="record" className="w-full" dir="rtl">
                              <TabsList className="w-full grid grid-cols-2 bg-[#111b21] rounded-xl h-12 p-1 border border-[#2f3b43]">
                                <TabsTrigger value="record" className="rounded-lg data-[state=active]:bg-[#202c33] data-[state=active]:text-[#00a884]">تسجيل بالمايكروفون</TabsTrigger>
                                <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-[#202c33] data-[state=active]:text-[#00a884]">رفع ملف صوتي</TabsTrigger>
                              </TabsList>
                              
                              <div className="bg-[#111b21] border border-[#2f3b43] rounded-xl p-4 mt-3">
                                <TabsContent value="record" className="m-0 space-y-4">
                                  {textAudioFile ? (
                                    <div className="flex items-center justify-between bg-[#182b28] border border-[#00a884] p-3 rounded-xl">
                                      <span className="text-[#00a884] font-bold flex items-center gap-2"><Play size={16}/> التسجيل جاهز — اضغط حفظ النص والتسجيل</span>
                                      <Button variant="ghost" size="sm" onClick={() => setTextAudioFile(null)} className="text-[#f44336] hover:bg-[#f44336]/10 h-8"><Trash2 size={16}/></Button>
                                    </div>
                                  ) : (
                                    <div className="flex justify-center">
                                      {isRecordingText ? (
                                        <Button onClick={stopRecordingText} className="w-full bg-[#f44336] hover:bg-[#d32f2f] text-white h-12 rounded-xl animate-pulse font-bold"><Square className="ml-2 h-5 w-5" /> إيقاف التسجيل</Button>
                                      ) : (
                                        <Button onClick={startRecordingText} variant="outline" className="w-full bg-transparent border-[#00a884] text-[#00a884] hover:bg-[#00a884]/10 h-12 rounded-xl font-bold"><Mic className="ml-2 h-5 w-5" /> ابدأ تسجيل القصة بصوتك</Button>
                                      )}
                                    </div>
                                  )}
                                </TabsContent>

                                <TabsContent value="upload" className="m-0 space-y-4">
                                  {textAudioFile ? (
                                     <div className="flex items-center justify-between bg-[#182b28] border border-[#00a884] p-3 rounded-xl">
                                       <span className="text-[#00a884] font-bold text-sm truncate max-w-[200px]" dir="ltr">{textAudioFile.name}</span>
                                       <Button variant="ghost" size="sm" onClick={() => setTextAudioFile(null)} className="text-[#f44336] hover:bg-[#f44336]/10 h-8"><Trash2 size={16}/></Button>
                                     </div>
                                  ) : (
                                    <div className="relative">
                                      <Input type="file" accept="audio/*" onChange={(e) => setTextAudioFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#2f3b43] rounded-xl p-6 bg-[#202c33]">
                                        <UploadCloud size={32} className="text-[#8696a0] mb-2" />
                                        <span className="text-[#8696a0] font-bold">اضغط هنا لاختيار ملف صوتي جاهز</span>
                                      </div>
                                    </div>
                                  )}
                                </TabsContent>
                              </div>
                            </Tabs>
                            {textAudioFile && textPreviewUrl ? (
                              <div className="space-y-2">
                                <p className="text-amber-300 text-sm">تسجيل جديد غير محفوظ. احفظه قبل تحديث الصفحة.</p>
                                <audio src={textPreviewUrl} controls className="w-full" />
                              </div>
                            ) : currentTextObjForSync?.audio_url ? (
                              <div className="space-y-2">
                                <p className="text-[#00a884] text-sm">التسجيل المحفوظ لهذه القصة</p>
                                <audio src={currentTextObjForSync.audio_url} controls className="w-full" />
                              </div>
                            ) : (
                              <p className="text-[#8696a0] text-sm">لا يوجد تسجيل محفوظ لهذه القصة.</p>
                            )}
                          </fieldset>

                          <div className="flex gap-2 flex-wrap md:flex-nowrap">
                            <Button onClick={saveTextDetails} disabled={isSavingTextDetails || isRecordingText} className="flex-1 bg-[#2a3942] border border-[#2f3b43] text-white hover:bg-[#00a884] hover:text-[#111b21] h-14 rounded-xl font-bold transition-colors text-sm md:text-base">
                              {isSavingTextDetails ? <Loader2 className="animate-spin h-5 w-5" /> : "حفظ النص والتسجيل"}
                            </Button>
                            <Button onClick={() => setIsTextUnlocked(!isTextUnlocked)} variant="outline" className={`h-14 px-3 md:px-5 rounded-xl font-bold border-2 text-sm md:text-base ${isTextUnlocked ? 'border-[#00a884] text-[#00a884] bg-[#00a884]/10' : 'border-[#2f3b43] text-[#8696a0] bg-transparent'}`}>
                              {isTextUnlocked ? <Unlock size={18} className="ml-1"/> : <LockIcon size={18} className="ml-1"/>} 
                              {isTextUnlocked ? 'مفتوح' : 'تعديل'}
                            </Button>
                            
                            <Button onClick={openSyncStudio} disabled={isSavingTextDetails || isRecordingText} variant="outline" className="h-14 px-3 md:px-5 rounded-xl font-bold border-2 border-[#2cb5db] text-[#2cb5db] hover:bg-[#2cb5db]/10 text-sm md:text-base">
                              <Sparkles size={18} className="ml-1" /> المزامنة
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className={`bg-[#202c33] border-none shadow-xl rounded-3xl overflow-hidden transition-opacity duration-300 ${!selectedText ? 'opacity-50 pointer-events-none' : ''}`}>
                    <CardHeader className="bg-[#2a3942] border-b border-[#2f3b43] pb-4">
                      <CardTitle className="text-xl text-white flex items-center gap-2"><Layers className="text-[#00cf9f]" /> إدارة المراحل</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <Label className="text-[#8696a0] font-bold text-base">اختر المرحلة:</Label>
                      <Select value={selectedLevel} onValueChange={(value) => {
                        setSelectedLevel(value);
                        localStorage.setItem('aamal_selected_level', value);
                      }}>
                        <SelectTrigger className="w-full h-14 text-lg bg-[#111b21] border-[#2f3b43] text-white rounded-xl focus:ring-[#00a884]" dir="rtl">
                          <SelectValue placeholder="اختر المرحلة" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#202c33] border-[#2f3b43] text-white" dir="rtl">
                          {levels.map((level) => (<SelectItem className="focus:bg-[#2a3942] focus:text-[#00a884] text-lg cursor-pointer" key={level.id} value={level.id.toString()}>{level.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-3 pt-2">
                        <Button onClick={handleAddNewLevel} className="flex-1 h-12 bg-[#00cf9f] hover:bg-[#00a884] text-[#111b21] font-bold rounded-xl"><FolderPlus className="ml-2 h-5 w-5" /> إضافة مرحلة</Button>
                        {selectedLevel && (
                          <>
                            <Button onClick={handleRenameLevel} variant="outline" className="h-12 bg-transparent border-[#2f3b43] text-white hover:bg-[#2a3942] rounded-xl"><Edit className="h-5 w-5" /></Button>
                            <Button onClick={handleDeleteLevel} variant="outline" className="h-12 bg-transparent border-[#f44336] text-[#f44336] hover:bg-[#3b1c1c] rounded-xl"><Trash2 className="h-5 w-5" /></Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedLevel && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <Card className="bg-[#202c33] border-2 border-[#00a884] shadow-[0_0_20px_rgba(0,168,132,0.1)] rounded-3xl overflow-hidden mt-8">
                      <CardHeader className="bg-[#182b28] border-b border-[#00a884]/30 pb-4">
                        <CardTitle className="text-2xl text-white flex items-center gap-2"><PlusCircle className="text-[#00a884]" /> إضافة محتوى جديد</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        
                        <Tabs defaultValue="lesson" className="w-full" dir="rtl">
                          <div className="w-full overflow-x-auto pb-2 mb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <TabsList className="inline-flex w-max min-w-full justify-start gap-2 h-auto p-2 bg-[#111b21] rounded-2xl border border-[#2f3b43]">
                              {challengeTypesList.map(tab => (
                                <TabsTrigger key={tab.id} value={tab.id} className="px-6 h-12 rounded-xl text-[#8696a0] font-bold text-base data-[state=active]:bg-[#00a884] data-[state=active]:text-[#111b21] transition-all whitespace-nowrap">
                                  {tab.label}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                          </div>

                          <TabsContent value="lesson" className="space-y-6">
                            <Label className="text-[#8696a0] font-bold">عنوان الصفحة (اختياري - يظهر بالأعلى):</Label>
                            <Input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="مثال: هيا نتعلم معاً" className="text-right bg-[#111b21] border-[#2f3b43] text-white h-14 text-lg rounded-xl" />
                            
                            <Label className="text-[#8696a0] font-bold">النص أو الشرح التعليمي (اختياري):</Label>
                            <Textarea value={lessonText} onChange={(e) => setLessonText(e.target.value)} placeholder="اكتب الشرح هنا ليقرأه الطالب..." className="text-right bg-[#111b21] border-[#2f3b43] text-white text-lg rounded-xl min-h-[100px]" />
                            
                            <Label className="text-[#8696a0] font-bold">صورة توضيحية (اختياري):</Label>
                            <Input type="file" accept="image/*" onChange={(e) => setLessonImage(e.target.files?.[0] || null)} className="text-right cursor-pointer bg-[#111b21] border-[#2f3b43] text-[#8696a0] h-14 rounded-xl file:bg-[#2a3942] file:text-white" />
                            
                            <Label className="text-[#8696a0] font-bold flex items-center gap-2">تسجيل صوتي يشرح الدرس بصوتك (اختياري):</Label>
                            <Input type="file" accept="audio/*" onChange={(e) => setLessonAudio(e.target.files?.[0] || null)} className="text-right cursor-pointer bg-[#111b21] border-[#2f3b43] text-[#8696a0] h-14 rounded-xl file:bg-[#2a3942] file:text-white" />
                            
                            <Button onClick={() => handleAddChallenge('lesson')} disabled={isUploading} className="w-full bg-[#00a884] hover:bg-[#00cf9f] text-[#111b21] font-bold h-14 text-lg rounded-xl">{isUploading ? "جاري الرفع والحفظ..." : "حفظ الصفحة التعليمية"}</Button>
                          </TabsContent>

                          <TabsContent value="reading" className="space-y-6">
                            <Label className="text-[#8696a0] font-bold">الجملة المطلوبة للقراءة:</Label>
                            <Input value={readingSentence} onChange={(e) => setReadingSentence(e.target.value)} placeholder="مثال: أنا أحب مدرستي" className="text-right bg-[#111b21] border-[#2f3b43] text-white h-14 text-lg rounded-xl" />
                            <Button onClick={() => handleAddChallenge('reading')} disabled={isUploading} className="w-full bg-[#00a884] hover:bg-[#00cf9f] text-[#111b21] font-bold h-14 text-lg rounded-xl">{isUploading ? "جاري الحفظ..." : "حفظ التحدي"}</Button>
                          </TabsContent>
                          
                          <TabsContent value="jumble" className="space-y-6">
                            <Label className="text-[#8696a0] font-bold">الكلمات للترتيب (مفصولة بفاصلة):</Label>
                            <Input value={jumbleWords} onChange={(e) => setJumbleWords(e.target.value)} placeholder="مثال: أنا, أحب, مدرستي" className="text-right bg-[#111b21] border-[#2f3b43] text-white h-14 text-lg rounded-xl" />
                            <Button onClick={() => handleAddChallenge('jumble')} disabled={isUploading} className="w-full bg-[#00a884] hover:bg-[#00cf9f] text-[#111b21] font-bold h-14 text-lg rounded-xl">{isUploading ? "جاري الحفظ..." : "حفظ التحدي"}</Button>
                          </TabsContent>

                          <TabsContent value="syllables" className="space-y-6">
                            <div className="bg-[#111b21] p-6 rounded-2xl border border-[#2f3b43] space-y-6">
                              <Label className="text-[#8696a0] font-bold text-lg block">الكلمة الصحيحة الكاملة:</Label>
                              <Input value={syllableWord} onChange={(e) => setSyllableWord(e.target.value)} placeholder="مثال: تطبيق" className="text-center text-2xl font-bold h-16 bg-[#182b28] border-[#00a884] text-[#00a884] rounded-xl" />
                              <Label className="text-[#8696a0] font-bold block mt-4">المقاطع (مفصولة بفاصلة):</Label>
                              <Input value={syllableParts} onChange={(e) => setSyllableParts(e.target.value)} placeholder="تَـ, طْـ, بِـ, يـ, ق" className="text-center text-xl tracking-widest bg-[#202c33] border-[#2f3b43] text-white h-14 rounded-xl" />
                            </div>
                            <Button onClick={() => handleAddChallenge('syllables')} disabled={isUploading} className="w-full bg-[#00a884] hover:bg-[#00cf9f] text-[#111b21] font-bold h-14 text-lg rounded-xl">{isUploading ? "جاري الحفظ..." : "حفظ التحدي"}</Button>
                          </TabsContent>

                          <TabsContent value="syllable_match" className="space-y-6">
                            <div className="bg-[#111b21] p-6 rounded-2xl border border-[#2f3b43] space-y-6">
                              <Label className="text-[#8696a0] font-bold text-lg block">الكلمة المقطعة:</Label>
                              <Input value={matchSyllableText} onChange={(e) => setMatchSyllableText(e.target.value)} placeholder="تَـ - طْـ - بِـ - يـ - ق" className="text-center text-2xl font-bold h-16 bg-[#202c33] border-[#2f3b43] text-white rounded-xl" />
                              <Label className="text-[#8696a0] font-bold block mt-4">خيارات الإجابة (كلمات كاملة):</Label>
                              <div className="grid grid-cols-3 gap-4">
                                {[0, 1, 2].map((i) => (<Input key={i} value={matchSyllableOptions[i]} onChange={(e) => { const newOpts = [...matchSyllableOptions]; newOpts[i] = e.target.value; setMatchSyllableOptions(newOpts); }} placeholder={`خيار ${i + 1}`} className="text-center bg-[#202c33] border-[#2f3b43] text-white h-14 rounded-xl" />))}
                              </div>
                              <Label className="text-[#00a884] font-bold">الكلمة الصحيحة:</Label>
                              <Input value={matchSyllableCorrect} onChange={(e) => setMatchSyllableCorrect(e.target.value)} placeholder="مثال: تطبيق" className="text-center font-bold bg-[#182b28] border-[#00a884] text-white h-14 rounded-xl" />
                            </div>
                            <Button onClick={() => handleAddChallenge('syllable_match')} disabled={isUploading} className="w-full bg-[#00a884] hover:bg-[#00cf9f] text-[#111b21] font-bold h-14 text-lg rounded-xl">{isUploading ? "جاري الحفظ..." : "حفظ التحدي"}</Button>
                          </TabsContent>

                          <TabsContent value="match" className="space-y-6">
                            <Label className="text-[#8696a0] font-bold">ارفع صورة التحدي:</Label>
                            <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-right cursor-pointer bg-[#111b21] border-[#2f3b43] text-[#8696a0] h-14 rounded-xl file:bg-[#2a3942] file:text-white" />
                            <Label className="text-[#8696a0] font-bold">خيارات الإجابة:</Label>
                            <div className="grid grid-cols-3 gap-4">
                              {[0, 1, 2].map((i) => (<Input key={i} value={options[i]} onChange={(e) => { const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts); }} placeholder={`خيار ${i + 1}`} className="text-center bg-[#111b21] border-[#2f3b43] text-white h-14 rounded-xl" />))}
                            </div>
                            <Label className="text-[#00a884] font-bold">الكلمة الصحيحة:</Label>
                            <Input value={matchWord} onChange={(e) => setMatchWord(e.target.value)} placeholder="الكلمة المطابقة للصورة" className="text-center font-bold bg-[#182b28] border-[#00a884] text-white h-14 rounded-xl" />
                            <Button onClick={() => handleAddChallenge('match')} disabled={isUploading} className="w-full bg-[#00a884] hover:bg-[#00cf9f] text-[#111b21] font-bold h-14 rounded-xl">{isUploading ? "جاري الرفع والحفظ..." : "حفظ التحدي"}</Button>
                          </TabsContent>
                          
                          <TabsContent value="audio_match" className="space-y-6">
                            <Label className="text-[#8696a0] font-bold">أدخل الكلمات وقم برفع أو تسجيل الملف الصوتي:</Label>
                            <div className="space-y-4">
                              {audioPairs.map((pair, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-4 items-center bg-[#111b21] p-4 rounded-2xl border border-[#2f3b43]">
                                  <Input value={pair.word} onChange={(e) => { const newPairs = [...audioPairs]; newPairs[index].word = e.target.value; setAudioPairs(newPairs); }} placeholder={`الكلمة ${index + 1}`} className="text-right w-full md:w-1/3 bg-[#202c33] border-[#2f3b43] text-white h-14 rounded-xl" />
                                  <div className="flex-1 w-full flex items-center gap-2">
                                    {pair.file ? (
                                      <div className="flex items-center gap-2 bg-[#182b28] px-4 py-3 rounded-xl border border-[#00a884] flex-1 justify-between">
                                        <span className="text-sm text-[#00a884] font-bold">🎵 تم إرفاق الصوت</span>
                                        <Button size="sm" variant="ghost" onClick={() => clearAudioFile(index)} className="text-[#f44336]"><Trash2 className="h-5 w-5" /></Button>
                                      </div>
                                    ) : (
                                      <>
                                        <Input type="file" accept="audio/*" onChange={(e) => { const file = e.target.files?.[0] || null; const newPairs = [...audioPairs]; newPairs[index].file = file; setAudioPairs(newPairs); }} className="text-right flex-1 bg-[#202c33] border-[#2f3b43] text-[#8696a0] h-14 rounded-xl file:bg-[#2a3942] file:text-white" />
                                        {recordingIndex === index ? (
                                          <Button onClick={stopRecording} className="bg-[#f44336] text-white animate-pulse h-14 rounded-xl"><Square className="h-5 w-5 ml-2" /> إيقاف</Button>
                                        ) : (
                                          <Button onClick={() => startRecording(index)} variant="outline" className="border-[#00a884] text-[#00a884] h-14 rounded-xl" disabled={recordingIndex !== null}><Mic className="h-5 w-5 ml-2" /> تسجيل</Button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                  <Button variant="ghost" onClick={() => removeAudioPair(index)} disabled={audioPairs.length <= 2} className="text-[#8696a0] hover:text-[#f44336]"><Trash2 className="h-6 w-6" /></Button>
                                </div>
                              ))}
                            </div>
                            <Button onClick={addAudioPair} variant="outline" className="w-full border-dashed border-2 border-[#2f3b43] text-[#8696a0] h-14 rounded-xl"><Plus className="ml-2 h-6 w-6" /> إضافة كلمة أخرى</Button>
                            <Button onClick={() => handleAddChallenge('audio_match')} disabled={isUploading || recordingIndex !== null} className="w-full bg-[#00a884] hover:bg-[#00cf9f] text-[#111b21] font-bold h-14 rounded-xl">{isUploading ? "جاري الرفع..." : "حفظ التحدي"}</Button>
                          </TabsContent>
                          
                          <TabsContent value="spelling" className="space-y-6">
                            <Label className="text-[#8696a0] font-bold">ارفع صورة تعبر عن الكلمة:</Label>
                            <Input type="file" accept="image/*" onChange={(e) => setSpellingImage(e.target.files?.[0] || null)} className="text-right bg-[#111b21] border-[#2f3b43] text-[#8696a0] h-14 rounded-xl file:bg-[#2a3942] file:text-white" />
                            <Label className="text-[#00a884] font-bold">الكلمة الصحيحة:</Label>
                            <Input value={spellingWord} onChange={(e) => setSpellingWord(e.target.value)} placeholder="مثال: تفاحة" className="text-center font-bold bg-[#182b28] border-[#00a884] text-white h-14 rounded-xl" />
                            <Button onClick={() => handleAddChallenge('spelling')} disabled={isUploading} className="w-full bg-[#00a884] font-bold text-[#111b21] h-14 rounded-xl">{isUploading ? "جاري الرفع..." : "حفظ التحدي"}</Button>
                          </TabsContent>
                          
                          <TabsContent value="missing_letter" className="space-y-6">
                            <Label className="text-[#8696a0] font-bold">ارفع صورة التحدي:</Label>
                            <Input type="file" accept="image/*" onChange={(e) => setMissingImage(e.target.files?.[0] || null)} className="text-right bg-[#111b21] border-[#2f3b43] text-[#8696a0] h-14 rounded-xl file:bg-[#2a3942] file:text-white" />
                            <Label className="text-[#8696a0] font-bold">الكلمة ناقصة (استخدم __):</Label>
                            <Input value={missingWord} onChange={(e) => setMissingWord(e.target.value)} placeholder="مثال: __ سد" className="text-center font-bold bg-[#111b21] border-[#2f3b43] text-white h-14 rounded-xl" />
                            <Label className="text-[#8696a0] font-bold">خيارات الحروف (3 خيارات):</Label>
                            <div className="grid grid-cols-3 gap-4">
                              {[0, 1, 2].map((i) => (<Input key={i} value={missingOptions[i]} onChange={(e) => { const newOpts = [...missingOptions]; newOpts[i] = e.target.value; setMissingOptions(newOpts); }} placeholder="حرف" className="text-center font-bold bg-[#111b21] border-[#2f3b43] text-white h-14 rounded-xl" />))}
                            </div>
                            <Label className="text-[#00a884] font-bold">الحرف الصحيح:</Label>
                            <Input value={correctLetter} onChange={(e) => setCorrectLetter(e.target.value)} placeholder="مثال: أ" className="text-center font-bold bg-[#182b28] border-[#00a884] text-white h-14 rounded-xl" />
                            <Button onClick={() => handleAddChallenge('missing_letter')} disabled={isUploading} className="w-full bg-[#00a884] font-bold text-[#111b21] h-14 rounded-xl">{isUploading ? "جاري الرفع..." : "حفظ التحدي"}</Button>
                          </TabsContent>
                          
                          <TabsContent value="letter_hunt" className="space-y-6">
                            <div className="bg-[#111b21] p-6 rounded-2xl border border-[#2f3b43] space-y-6 text-center">
                              <Label className="text-[#8696a0] font-bold text-lg block">الحرف الهدف 🎯</Label>
                              <Input value={huntTarget} onChange={(e) => setHuntTarget(e.target.value)} placeholder="ب" className="text-center text-4xl font-bold h-20 w-32 mx-auto bg-[#182b28] border-[#00a884] text-[#00a884] rounded-2xl" />
                              <Label className="text-[#8696a0] font-bold text-right block mt-4">الحروف المشتتة (مفصولة بفاصلة):</Label>
                              <Input value={huntDistractors} onChange={(e) => setHuntDistractors(e.target.value)} placeholder="ت, ث, ن, ي" className="text-center text-2xl tracking-widest bg-[#202c33] border-[#2f3b43] text-white h-14 rounded-xl" />
                            </div>
                            <Button onClick={() => handleAddChallenge('letter_hunt')} disabled={isUploading} className="w-full bg-[#00a884] font-bold text-[#111b21] h-14 rounded-xl">{isUploading ? "جاري الرفع..." : "حفظ التحدي"}</Button>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#202c33] border-none shadow-xl rounded-3xl overflow-hidden">
                      <CardHeader className="bg-[#2a3942] border-b border-[#2f3b43] pb-4">
                        <CardTitle className="text-xl text-white">تحديات المرحلة الحالية</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table dir="rtl" className="w-full">
                          <TableHeader className="bg-[#111b21]">
                            <TableRow className="border-[#2f3b43]">
                              <TableHead className="text-right font-bold text-[#8696a0] py-4 px-6 w-48">نوع التحدي</TableHead>
                              <TableHead className="text-right font-bold text-[#8696a0] py-4 px-6">المحتوى</TableHead>
                              <TableHead className="text-left font-bold text-[#8696a0] py-4 px-6 w-24">إجراء</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {challenges.length > 0 ? (
                              challenges.map((challenge, index) => (
                                <TableRow key={challenge.id} className="border-[#2f3b43] hover:bg-[#2a3942] bg-[#202c33]" draggable onDragStart={() => (dragItem.current = index)} onDragEnter={() => (dragOverItem.current = index)} onDragEnd={handleSort} onDragOver={(e) => e.preventDefault()}>
                                  <TableCell className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                      <div className="cursor-grab text-[#54656f] p-1 bg-[#111b21] rounded-md"><GripVertical className="h-6 w-6" /></div>
                                      <Badge className="bg-[#111b21] text-[#00a884] border border-[#00a884]/30">{getChallengeTypeName(challenge.challenge_type)}</Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4 px-6 text-slate-300 font-medium">
                                    {challenge.content.substring(0, 60)}{challenge.content.length > 60 ? '...' : ''}
                                  </TableCell>
                                  <TableCell className="py-4 px-6 text-left">
                                    <Button onClick={() => handleDeleteChallenge(challenge.id)} variant="ghost" size="icon" className="text-[#f44336] hover:bg-[#3b1c1c] rounded-xl"><Trash2 className="h-5 w-5" /></Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow><TableCell colSpan={3} className="text-center h-32 text-[#8696a0] text-lg">لا يوجد تحديات مضافة لهذه المرحلة.</TableCell></TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'progress' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-[#202c33] p-0 rounded-3xl border-none shadow-xl overflow-hidden">
                  <div className="bg-[#2a3942] border-b border-[#2f3b43] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Layers className="text-[#00a884]" /> متابعة أداء الطلاب
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-2 bg-[#111b21] p-1.5 rounded-xl border border-[#2f3b43]">
                      <Button variant="ghost" onClick={() => setSortBy('newest')} className={`h-9 px-4 rounded-lg text-sm font-bold transition-all ${sortBy === 'newest' ? 'bg-[#202c33] text-[#00a884] shadow-sm' : 'text-[#8696a0] hover:text-white'}`}>الأحدث</Button>
                      <Button variant="ghost" onClick={() => setSortBy('name')} className={`h-9 px-4 rounded-lg text-sm font-bold transition-all ${sortBy === 'name' ? 'bg-[#202c33] text-[#00a884] shadow-sm' : 'text-[#8696a0] hover:text-white'}`}>الاسم</Button>
                      <Button variant="ghost" onClick={() => setSortBy('age')} className={`h-9 px-4 rounded-lg text-sm font-bold transition-all ${sortBy === 'age' ? 'bg-[#202c33] text-[#00a884] shadow-sm' : 'text-[#8696a0] hover:text-white'}`}>العمر</Button>
                      <Button variant="ghost" onClick={() => setSortBy('completed')} className={`h-9 px-4 rounded-lg text-sm font-bold transition-all ${sortBy === 'completed' ? 'bg-[#202c33] text-[#00a884] shadow-sm' : 'text-[#8696a0] hover:text-white'}`}>التحديات المنجزة</Button>
                      <Filter className="text-[#8696a0] ml-2" size={16} />
                    </div>
                  </div>

                  <div className="overflow-x-auto p-4">
                    {loadingStudents ? (
                      <div className="text-center text-[#8696a0] py-10">جاري تحميل البيانات...</div>
                    ) : sortedStudents.length === 0 ? (
                      <div className="text-center text-[#8696a0] py-10">لا يوجد طلاب مسجلين حالياً</div>
                    ) : (
                      <table className="w-full text-right">
                        <thead>
                          <tr className="border-b border-[#2f3b43] text-[#8696a0]">
                            <th className="pb-3 px-4 font-medium">اسم الطالب</th>
                            <th className="pb-3 px-4 font-medium">المرحلة الحالية</th>
                            <th className="pb-3 px-4 font-medium">التحديات المنجزة</th>
                            <th className="pb-3 px-4 font-medium text-left">إجراء</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedStudents.map((student) => (
                            <tr key={student.id} className="border-b border-[#2f3b43] hover:bg-[#2a3942] transition-colors">
                              <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-[#111b21] flex items-center justify-center text-[#00a884]">
                                  <User size={16} />
                                </div>
                                {student.name}
                              </td>
                              <td className="py-4 px-4 text-[#2cb5db]">{student.currentLevel}</td>
                              <td className="py-4 px-4 text-[#8696a0] font-bold">{student.completedChallenges} تحدي</td>
                              <td className="py-4 px-4 text-left">
                                <Button 
                                  onClick={() => setSelectedStudentForStats(student)}
                                  variant="outline" 
                                  className="border-[#00a884] text-[#00a884] hover:bg-[#00a884] hover:text-[#111b21] transition-colors rounded-xl h-10"
                                >
                                  عرض الأداء <Activity className="mr-2 h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audios' && (
              <div className="animate-in fade-in duration-300">
                <Card className="bg-[#202c33] border-none shadow-xl rounded-3xl overflow-hidden mt-8">
                  <CardHeader className="bg-[#2a3942] border-b border-[#2f3b43] pb-6">
                    <CardTitle className="text-xl text-white flex items-center gap-2"><Volume2 className="text-[#00a884]" /> إعدادات الأصوات الافتراضية</CardTitle>
                    <p className="text-[#8696a0] text-sm mt-2 leading-relaxed">
                      سجل التعليمات الصوتية مرة واحدة لكل نوع تحدي (مثل: "يا بطل، رتب المقاطع لتصنع كلمة"). سيقوم النظام بحفظ هذه الأصوات وإضافتها تلقائياً لأي تحدي جديد تقوم بإنشائه دون الحاجة لرفعها في كل مرة!
                    </p>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {challengeTypesList.map((typeObj) => (
                        <div key={typeObj.id} className="bg-[#111b21] border border-[#2f3b43] rounded-2xl p-5 flex flex-col justify-between">
                          <Label className="text-white font-bold text-lg mb-4 text-center">{typeObj.label}</Label>
                          
                          {defaultAudios[typeObj.id] ? (
                            <div className="bg-[#182b28] border border-[#00a884] rounded-xl p-3 flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[#00a884] font-bold text-sm">🎵 الصوت محفوظ ومفعل</span>
                                <Button 
                                  size="sm" variant="ghost" 
                                  onClick={() => {
                                    const newAudios = { ...defaultAudios };
                                    delete newAudios[typeObj.id];
                                    setDefaultAudios(newAudios);
                                    localStorage.setItem(`aamal_default_audios_${session.user.id}`, JSON.stringify(newAudios));
                                  }} 
                                  className="text-[#f44336] hover:bg-[#f44336]/10 h-8 px-2"
                                >
                                  حذف <Trash2 size={14} className="ml-1"/>
                                </Button>
                              </div>
                              <audio src={defaultAudios[typeObj.id]} controls className="w-full h-10 rounded-lg" />
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {recordingDefaultType === typeObj.id ? (
                                <Button onClick={stopRecordingDefault} className="bg-[#f44336] hover:bg-[#d32f2f] text-white h-12 rounded-xl animate-pulse font-bold w-full"><Square className="ml-2 h-5 w-5" /> إيقاف التسجيل</Button>
                              ) : (
                                <Button onClick={() => startRecordingDefault(typeObj.id)} disabled={recordingDefaultType !== null} variant="outline" className="bg-[#202c33] border-[#2f3b43] text-white hover:bg-[#2a3942] h-12 rounded-xl w-full"><Mic className="ml-2 h-5 w-5 text-[#00a884]" /> سجل بصوتك</Button>
                              )}
                              <div className="relative w-full">
                                <Input type="file" accept="audio/*" onChange={(e) => {
                                  if (e.target.files?.[0]) uploadDefaultAudio(typeObj.id, e.target.files[0])
                                }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <Button variant="outline" className="w-full bg-[#202c33] border-[#2f3b43] text-[#8696a0] h-12 rounded-xl pointer-events-none border-dashed"><UploadCloud className="ml-2 h-5 w-5" /> رفع ملف جاهز</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="animate-in fade-in duration-300">
                <Card className="bg-[#202c33] border-none shadow-xl rounded-3xl overflow-hidden max-w-2xl mx-auto mt-8">
                  <CardHeader className="bg-[#2a3942] border-b border-[#2f3b43] pb-4">
                    <CardTitle className="text-xl text-white flex items-center gap-2"><Settings className="text-[#00a884]" /> تحديث بيانات الحساب</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8 space-y-6">
                    <form onSubmit={handleUpdateSettings} className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[#8696a0] font-bold">الاسم المعروض</Label>
                        <div className="relative">
                          <User className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8696a0] h-5 w-5" />
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="اسمك الكريم" className="pl-4 pr-12 text-right bg-[#111b21] border-[#2f3b43] text-white h-14 rounded-xl focus-visible:border-[#00a884] text-lg" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#8696a0] font-bold">البريد الإلكتروني (الإيميل)</Label>
                        <div className="relative">
                          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8696a0] h-5 w-5" />
                          <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="تعديل الإيميل" className="pl-4 pr-12 text-left bg-[#111b21] border-[#2f3b43] text-white h-14 rounded-xl focus-visible:border-[#00a884] text-lg" dir="ltr" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#8696a0] font-bold">تغيير كلمة المرور (اختياري)</Label>
                        <div className="relative">
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8696a0] h-5 w-5" />
                          <Input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="اترك الحقل فارغاً إذا لا تريد تغييره" className="pl-4 pr-12 text-left bg-[#111b21] border-[#2f3b43] text-white h-14 rounded-xl focus-visible:border-[#00a884] text-lg" dir="ltr" />
                        </div>
                      </div>
                      <Button disabled={settingsLoading} type="submit" className="w-full bg-[#00a884] hover:bg-[#00cf9f] text-[#111b21] font-bold h-14 text-lg rounded-xl">
                        {settingsLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
                      </Button>
                    </form>
                    
                    <div className="pt-6 mt-6 border-t border-[#2f3b43] space-y-4">
                      <Button type="button" onClick={handleSignOut} variant="outline" className="w-full h-14 bg-transparent border-[#8696a0] text-[#8696a0] hover:bg-[#2a3942] hover:text-white rounded-xl text-lg">
                        <LogOut className="h-6 w-6 ml-2" /> تسجيل الخروج
                      </Button>
                      
                      <Button type="button" onClick={handleDeleteAccount} variant="outline" className="w-full h-14 bg-transparent border-[#f44336] text-[#f44336] hover:bg-[#f44336] hover:text-white rounded-xl text-lg mt-4">
                        <AlertTriangle className="h-6 w-6 ml-2" /> حذف الحساب نهائياً
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Modal استوديو المزامنة */}
        {showSyncStudio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" dir="rtl">
            <div className="bg-[#202c33] border border-[#2f3b43] rounded-3xl w-full max-w-4xl max-h-[90vh] p-6 shadow-2xl flex flex-col gap-6 overflow-y-auto">
              <div className="flex justify-between items-center border-b border-[#2f3b43] pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Sparkles className="text-[#00a884]"/> استوديو المزامنة الذكية</h2>
                <button onClick={() => setShowSyncStudio(false)} className="text-[#8696a0] hover:text-white"><X size={24}/></button>
              </div>
              
              {!syncAudioSrc ? (
                <div className="text-center p-10 text-[#f44336] font-bold text-xl">
                  ⚠️ الرجاء حفظ النص وتسجيل أو رفع ملف صوتي للقصة أولاً!
                </div>
              ) : (
                <>
                  <div className="bg-[#111b21] p-6 rounded-2xl border border-[#2f3b43] min-h-[200px] flex flex-wrap gap-3 items-center justify-center content-start">
                    {syncWords.map((w, i) => {
                      let stateColor = "text-[#8696a0] bg-[#202c33]";
                      if (i < currentSyncIndex) stateColor = "text-white bg-[#00a884]";
                      else if (i === currentSyncIndex) stateColor = "text-[#111b21] bg-[#ffbf00] scale-110 shadow-lg border-2 border-white";
                      
                      return (
                        <div key={i} className={`px-4 py-2 rounded-xl text-2xl font-bold transition-all duration-200 ${stateColor}`}>
                          {w}
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="flex flex-col items-center gap-6">
                    <audio ref={syncAudioRef} src={syncAudioSrc} controls className="w-full" />
                    
                    <div className="text-center">
                      <p className="text-[#8696a0] font-bold text-lg mb-2">شغّل الصوت، ثم اضغط على (Space) أو الزر أدناه مع بداية نطق كل كلمة.</p>
                      <p className="text-[#00a884]">الكلمات المتزامنة: {currentSyncIndex} / {syncWords.length}</p>
                    </div>

                    <div className="flex gap-4 w-full">
                      <Button 
                        onClick={handleCaptureSync} 
                        disabled={currentSyncIndex >= syncWords.length} 
                        className="flex-1 h-16 text-2xl bg-[#00a884] hover:bg-[#00cf9f] text-[#111b21] font-bold rounded-2xl transition-all active:scale-95"
                      >
                        {currentSyncIndex >= syncWords.length ? "✅ تمت المزامنة بنجاح" : "تسجيل الكلمة 👈 (أو اضغط Space)"}
                      </Button>
                      <Button 
                        onClick={() => { 
                          setCurrentSyncIndex(0); 
                          setSyncTimestamps(new Array(syncWords.length).fill(null)); 
                          if (syncAudioRef.current) syncAudioRef.current.currentTime = 0; 
                        }} 
                        variant="outline" 
                        className="h-16 px-8 border-2 border-[#f44336] text-[#f44336] hover:bg-[#3b1c1c] rounded-2xl font-bold text-xl"
                      >
                        إعادة الضبط
                      </Button>
                    </div>

                    <Button onClick={() => setShowSyncStudio(false)} className="w-full mt-2 h-14 bg-[#2a3942] text-white hover:bg-[#3b4a54] rounded-xl font-bold text-lg">
                      تأكيد وإغلاق الاستوديو
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Modal ترتيب الجلسات */}
        {showTextReorderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" dir="rtl">
            <div className="bg-[#202c33] border border-[#2f3b43] rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center border-b border-[#2f3b43] pb-4 mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><GripVertical className="text-[#00a884]"/> ترتيب الجلسات (النصوص)</h2>
                <button onClick={() => setShowTextReorderModal(false)} className="text-[#8696a0] hover:text-white"><X size={24}/></button>
              </div>
              <p className="text-[#8696a0] mb-4 text-sm">اسحب الجلسة للأعلى أو الأسفل لترتيبها (سيتم الحفظ تلقائياً).</p>
              
              <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
                {texts.map((text, index) => (
                  <div
                    key={text.id}
                    draggable
                    onDragStart={() => (textDragItem.current = index)}
                    onDragEnter={() => (textDragOverItem.current = index)}
                    onDragEnd={handleTextSort}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center gap-3 bg-[#111b21] p-4 rounded-xl border border-[#2f3b43] cursor-grab active:cursor-grabbing hover:bg-[#2a3942] transition-colors"
                  >
                    <GripVertical className="text-[#54656f]" />
                    <span className="text-white font-bold text-lg">{text.name}</span>
                  </div>
                ))}
              </div>

              <Button onClick={() => setShowTextReorderModal(false)} className="w-full mt-6 bg-[#00a884] hover:bg-[#00cf9f] text-[#111b21] font-bold h-12 rounded-xl text-lg">
                تم الانتهاء
              </Button>
            </div>
          </div>
        )}

        {dialogConfig.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
            <div className="bg-[#202c33] p-6 rounded-2xl border border-[#2f3b43] w-96 max-w-[90%] shadow-2xl animate-in zoom-in-95 duration-300">
               <h3 className="text-white text-xl font-bold mb-4">{dialogConfig.title}</h3>
               {dialogConfig.message && <p className="text-[#8696a0] mb-4 text-sm leading-relaxed">{dialogConfig.message}</p>}
               {dialogConfig.type === 'prompt' && (
                  <Input 
                    autoFocus
                    value={dialogConfig.inputValue} 
                    onChange={(e) => setDialogConfig({...dialogConfig, inputValue: e.target.value})} 
                    className="mb-6 text-right bg-[#111b21] border-[#2f3b43] text-white h-12 focus-visible:ring-[#00a884] rounded-xl" 
                  />
               )}
               <div className="flex gap-3 mt-2">
                  <Button onClick={() => dialogConfig.onConfirm(dialogConfig.inputValue)} className={`flex-1 font-bold rounded-xl h-12 ${dialogConfig.type === 'confirm' && dialogConfig.title.includes('حذف') ? 'bg-[#f44336] hover:bg-[#d32f2f] text-white' : 'bg-[#00a884] hover:bg-[#00cf9f] text-[#111b21]'}`}>
                    تأكيد
                  </Button>
                  <Button variant="outline" onClick={() => setDialogConfig({...dialogConfig, isOpen: false})} className="flex-1 border-[#2f3b43] text-[#8696a0] hover:bg-[#2a3942] hover:text-white rounded-xl h-12">
                    إلغاء
                  </Button>
               </div>
            </div>
          </div>
        )}

        {selectedStudentForStats && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#202c33] border border-[#2f3b43] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
              
              <div className="flex items-center justify-between p-6 border-b border-[#2f3b43] bg-[#2a3942] sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-[#00a884]/20 p-3 rounded-xl text-[#00a884]">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">الملف الشخصي وأداء الطالب</h2>
                  </div>
                </div>
                <button onClick={() => setSelectedStudentForStats(null)} className="text-[#8696a0] hover:text-white bg-[#111b21] p-2 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#111b21] p-4 rounded-2xl border border-[#2f3b43] text-center flex flex-col items-center justify-center">
                    <User className="mb-2 text-[#00a884]" size={28} />
                    <p className="text-[#8696a0] text-sm mb-1">الاسم</p>
                    <p className="text-white font-bold text-lg">{selectedStudentForStats.name}</p>
                  </div>
                  <div className="bg-[#111b21] p-4 rounded-2xl border border-[#2f3b43] text-center flex flex-col items-center justify-center">
                    <Calendar className="mb-2 text-[#00a884]" size={28} />
                    <p className="text-[#8696a0] text-sm mb-1">العمر</p>
                    <p className="text-white font-bold text-lg">{selectedStudentForStats.age}</p>
                  </div>
                  <div className="bg-[#111b21] p-4 rounded-2xl border border-[#2f3b43] text-center flex flex-col items-center justify-center">
                    <Phone className="mb-2 text-[#00a884]" size={28} />
                    <p className="text-[#8696a0] text-sm mb-1">رقم الهاتف</p>
                    <p className="text-white font-bold text-lg" dir="ltr">{selectedStudentForStats.phone}</p>
                  </div>
                  <div className="bg-[#111b21] p-4 rounded-2xl border border-[#2f3b43] text-center flex flex-col items-center justify-center">
                    <Trophy className="mb-2 text-[#00a884]" size={28} />
                    <p className="text-[#8696a0] text-sm mb-1">التحديات المنجزة</p>
                    <p className="text-white font-bold text-lg">{selectedStudentForStats.completedChallenges}</p>
                  </div>
                </div>

                <div className="border-t border-[#2f3b43] pt-6">
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex bg-[#111b21] p-1 rounded-xl border border-[#2f3b43]">
                      <button onClick={() => setStatsFilter('week')} className={`px-6 py-2 rounded-lg font-bold transition-all ${statsFilter === 'week' ? 'bg-[#202c33] text-[#00a884] shadow-md' : 'text-[#8696a0] hover:text-white'}`}>أسبوع</button>
                      <button onClick={() => setStatsFilter('month')} className={`px-6 py-2 rounded-lg font-bold transition-all ${statsFilter === 'month' ? 'bg-[#202c33] text-[#00a884] shadow-md' : 'text-[#8696a0] hover:text-white'}`}>شهر</button>
                      <button onClick={() => setStatsFilter('all')} className={`px-6 py-2 rounded-lg font-bold transition-all ${statsFilter === 'all' ? 'bg-[#202c33] text-[#00a884] shadow-md' : 'text-[#8696a0] hover:text-white'}`}>الكل</button>
                    </div>
                  </div>

                  <div className="h-72 w-full" style={{ direction: 'ltr' }}>
                    {isChartLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-[#00a884]" />
                        <span className="text-[#8696a0] ml-3 font-bold">جاري حساب الإحصائيات...</span>
                      </div>
                    ) : studentChartData.length === 0 ? (
                       <div className="flex items-center justify-center h-full flex-col">
                         <Activity className="h-12 w-12 text-[#2f3b43] mb-3" />
                         <span className="text-[#8696a0] font-bold text-lg">لم يقم الطالب بأي نشاط في هذه الفترة 📭</span>
                       </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={studentChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2f3b43" vertical={false} />
                          <XAxis dataKey="name" stroke="#8696a0" tick={{fill: '#8696a0'}} />
                          <YAxis stroke="#8696a0" tick={{fill: '#8696a0'}} allowDecimals={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#111b21', borderColor: '#2f3b43', borderRadius: '12px', color: '#fff', textAlign: 'right' }} itemStyle={{ fontWeight: 'bold' }} cursor={{fill: '#2a3942', opacity: 0.4}} />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Bar dataKey="completed" name="إجابات صحيحة" fill="#00a884" radius={[4, 4, 0, 0]} barSize={30} />
                          <Bar dataKey="errors" name="أخطاء" fill="#f44336" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
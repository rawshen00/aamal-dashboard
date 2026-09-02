import { createClient } from '@supabase/supabase-js';

// استبدل القيم بالمعلومات الخاصة بمشروعك
const supabaseUrl = 'https://eqpzaycvifuweqvktxpy.supabase.co';
const supabaseAnonKey = 'sb_publishable_cwdWc0j1kyblOk803wi0Ew_gcs5IW6n';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// ضيف هاي الدالة بآخر ملف supabase.ts أو supabase.js في الموبايل
export const logStudentActivity = async (studentId: string, actionType: 'completed' | 'error') => {
      try {
     const { error } = await supabase
      .from('activity_logs')
      .insert([
        { 
          student_id: studentId, 
          action_type: actionType 
        }
      ]);

    if (error) throw error;
    console.log(`✅ تم تسجيل النشاط بنجاح: ${actionType}`);
  } catch (error) {
    console.error('❌ خطأ في تسجيل نشاط الطالب:', error);
  }
};
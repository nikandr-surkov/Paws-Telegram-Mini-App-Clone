import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kbobouvvhdtjwdwyejxy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtib2JvdXZ2aGR0andkd3llanh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2ODE1MDUsImV4cCI6MjA1NDI1NzUwNX0.ds7FhESBmy3_AEnz51n_tvlgYMHDrj3jyupIm6UD3p4'

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Task = {
  id: string
  title: string
  reward_amount: number
  reward_currency: string
  icon_type: 'component' | 'image'
  icon_value: string
  created_at: string
}

export type UserTask = {
  id: string
  user_id: string
  task_id: string
  status: 'pending' | 'completed' | 'failed'
  completed_at: string | null
  created_at: string
}

export const fetchTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Task[]
}

export const fetchUserTasks = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_tasks')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data as UserTask[]
}

export const startTask = async (userId: string, taskId: string) => {
  const { data, error } = await supabase
    .from('user_tasks')
    .insert([
      {
        user_id: userId,
        task_id: taskId,
        status: 'pending'
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data as UserTask
}

export const completeTask = async (userId: string, taskId: string) => {
  const { data, error } = await supabase
    .from('user_tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .select()
    .single()

  if (error) throw error
  return data as UserTask
}

export const verifyGhostEmojiTask = async (userId: string, taskId: string, telegramUsername: string) => {
  try {
    // Önce Telegram API'den kullanıcı bilgilerini al
    const response = await fetch(`https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/getChatMember`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: '@ghostchain', // Telegram kanal/grup ID'si
        user_id: telegramUsername
      })
    });

    const data = await response.json();
    
    if (data.ok && data.result.user.first_name.includes('👻')) {
      // Emoji bulundu, görevi tamamla
      return await completeTask(userId, taskId);
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying ghost emoji task:', error);
    throw error;
  }
}

export const checkTaskStatus = async (userId: string, taskId: string) => {
  const { data, error } = await supabase
    .from('user_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .single();

  if (error) throw error;
  return data;
} 
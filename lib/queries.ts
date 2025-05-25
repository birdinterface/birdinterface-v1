import { genSaltSync, hashSync } from 'bcrypt-ts'

import { supabase, User, Chat, Task, ActionLog, UserPreferences, RecurringTaskSupabase } from './supabase'

// USER
export async function getUser(email: string): Promise<User[]> {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('email', email)
  if (error) throw error
  return data || []
}

export async function createUser(email: string, password: string | null, name: string) {
  const passwordHash = password ? hashSync(password, genSaltSync(10)) : null
  const { data, error } = await supabase
    .from('User')
    .insert({
      email,
      password: passwordHash,
      name,
      membership: 'free',
      usage: '0.0000',
      stripecustomerid: null,
      stripesubscriptionid: null,
      previoussubscriptionid: null,
      provider: 'google',
    })
    .select()
  if (error) throw error
  return data
}

export async function updateUser(userId: string, data: Partial<User>) {
  const { data: updated, error } = await supabase
    .from('User')
    .update(data)
    .eq('id', userId)
    .select()
  if (error) throw error
  return updated?.[0]
}

export async function updateUserBystripecustomerid(stripecustomerid: string, data: Partial<User>) {
  const { data: updated, error } = await supabase
    .from('User')
    .update(data)
    .eq('stripecustomerid', stripecustomerid)
    .select()
  if (error) throw error
  return updated?.[0]
}

export async function updateUserUsage(userId: string, newUsage: string) {
  const { error } = await supabase
    .from('User')
    .update({ usage: newUsage })
    .eq('id', userId)
  if (error) throw error
}

export async function updateUserData(userId: string, data: Partial<User>) {
  const { error } = await supabase
    .from('User')
    .update(data)
    .eq('id', userId)
  if (error) throw error
}

// CHAT
export async function saveChat({ id, messages, userId }: { id: string; messages: any; userId: string }) {
  // Check if chat exists
  const { data: existing, error: fetchError } = await supabase
    .from('Chat')
    .select('*')
    .eq('id', id)
  if (fetchError) throw fetchError
  if (existing && existing.length > 0) {
    // Update
    const { data, error } = await supabase
      .from('Chat')
      .update({ messages: JSON.stringify(messages), updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
    if (error) throw error
    return data
  } else {
    // Insert
    const { data, error } = await supabase
      .from('Chat')
      .insert({
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: JSON.stringify(messages),
        userId,
      })
      .select()
    if (error) throw error
    return data
  }
}

export async function deleteChatById({ id }: { id: string }) {
  const { error } = await supabase
    .from('Chat')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getChatsByUserId({ id }: { id: string }) {
  const { data, error } = await supabase
    .from('Chat')
    .select('*')
    .eq('userId', id)
    .order('updatedAt', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getChatById({ id }: { id: string }) {
  const { data, error } = await supabase
    .from('Chat')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// TASK
export async function createTask(userId: string, data: Pick<Task, 'title' | 'description' | 'status'> & { dueDate?: string | null }): Promise<Task> {
  const insertData: any = {
    title: data.title,
    description: data.description,
    status: data.status,
    userid: userId,
    completed: false, // Default completed to false for new tasks
    duedate: data.dueDate ? data.dueDate : null // Set duedate to null if dueDate is empty or null
  };

  // Remove dueDate from the object if it was passed, as we mapped it to duedate
  // delete insertData.dueDate; // This is no longer needed as we directly use data.dueDate

  console.log('Inserting task:', insertData);
  const response = await supabase
    .from('Task')
    .insert(insertData)
    .select();
  console.log('Supabase insert response:', response);
  if (response.error) {
    console.error(
      'Supabase createTask error details:',
      {
        message: response.error.message,
        details: response.error.details,
        hint: response.error.hint,
        code: response.error.code,
      }
    );
    throw response.error;
  }
  return response.data?.[0];
}

export async function updateTask(taskId: string, userId: string, data: Partial<Task>): Promise<Task> {
  const updateData: any = { ...data, updatedat: new Date().toISOString() };
  if (updateData.dueDate !== undefined) {
    updateData.duedate = updateData.dueDate || null; // Set to null if empty string
    delete updateData.dueDate;
  }
  if (updateData.completedAt !== undefined) {
    updateData.completedat = updateData.completedAt || null; // Set to null if empty string
    delete updateData.completedAt;
  }
  console.log(`Updating task ${taskId} for user ${userId} with data:`, updateData);
  const { data: updated, error, status, statusText } = await supabase
    .from('Task')
    .update(updateData)
    .eq('id', taskId)
    .eq('userid', userId)
    .select();
  console.log('Supabase response from updateTask:', { data: updated, error, status, statusText });
  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }
  return updated?.[0];
}

export async function deleteTask(taskId: string, userId: string): Promise<void> {
  console.log(`Deleting task ${taskId} for user ${userId}`);
  const { error, status, statusText } = await supabase
    .from('Task')
    .delete()
    .eq('id', taskId)
    .eq('userid', userId);
  console.log('Supabase response from deleteTask:', { error, status, statusText });
  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

export async function getUserTasks(userId: string): Promise<Task[]> {
  console.log(`Fetching tasks for userId: ${userId}`);
  const { data, error, status, statusText } = await supabase
    .from('Task')
    .select('*')
    .eq('userid', userId)
    .order('updatedat', { ascending: false });

  console.log('Supabase response from getUserTasks:', { data, error, status, statusText });

  if (error) {
    console.error('Error fetching user tasks:', error);
    throw error;
  }
  console.log('Tasks fetched for user:', data);
  return data || [];
}

// ACTION LOG
export async function logTaskAction(data: Omit<ActionLog, 'id' | 'timestamp'>): Promise<ActionLog> {
  const { data: inserted, error } = await supabase
    .from('ActionLog')
    .insert({ ...data, timestamp: new Date().toISOString() })
    .select()
  if (error) throw error
  return inserted?.[0]
}

export async function getTaskActionLogs(taskId: string): Promise<ActionLog[]> {
  const { data, error } = await supabase
    .from('ActionLog')
    .select('*')
    .eq('taskId', taskId)
    .order('timestamp', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getUserActionLogs(userId: string): Promise<ActionLog[]> {
  const { data, error } = await supabase
    .from('ActionLog')
    .select('*')
    .eq('userId', userId)
    .order('timestamp', { ascending: false })
  if (error) throw error
  return data || []
}

// USER PREFERENCES
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('UserPreferences')
    .select('*')
    .eq('userId', userId)
    .single()
  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null
    }
    throw error
  }
  return data
}

export async function saveUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
  // Check if preferences exist
  const { data: existing, error: fetchError } = await supabase
    .from('UserPreferences')
    .select('*')
    .eq('userId', userId)
  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
  
  if (existing && existing.length > 0) {
    // Update
    const { data, error } = await supabase
      .from('UserPreferences')
      .update({ ...preferences, updatedAt: new Date().toISOString() })
      .eq('userId', userId)
      .select()
    if (error) throw error
    return data[0]
  } else {
    // Insert
    const { data, error } = await supabase
      .from('UserPreferences')
      .insert({
        userId,
        ...preferences,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
    if (error) throw error
    return data[0]
  }
}

// RECURRING TASK
export async function createRecurringTask(userId: string, data: Pick<RecurringTaskSupabase, 'title' | 'description' | 'status' | 'recurrencepattern'> & { dueDate?: string | null }): Promise<RecurringTaskSupabase> {
  const insertData: Omit<RecurringTaskSupabase, 'id' | 'createdat' | 'updatedat' | 'completedat'> & { duedate?: string | null } = {
    title: data.title,
    description: data.description,
    status: data.status,
    userid: userId,
    completed: false, // Default completed to false for new tasks
    duedate: data.dueDate ? data.dueDate : null, // Map from dueDate to duedate for Supabase
    recurrencepattern: data.recurrencepattern,
  };

  console.log('Inserting recurring task:', insertData);
  const response = await supabase
    .from('RecurringTask') // Ensure this table name matches your Supabase table
    .insert(insertData)
    .select()
    .single(); // Assuming insert returns a single record
  console.log('Supabase insert recurring response:', response);
  if (response.error) {
    console.error(
      'Supabase createRecurringTask error details:',
      {
        message: response.error.message,
        details: response.error.details,
        hint: response.error.hint,
        code: response.error.code,
      }
    );
    throw response.error;
  }
  return response.data;
}

export async function updateRecurringTask(taskId: string, userId: string, data: Partial<Omit<RecurringTaskSupabase, 'id' | 'createdat' | 'userid'>> & { dueDate?: string | null, completedAt?: string | null }): Promise<RecurringTaskSupabase> {
  
  const { dueDate, completedAt, ...restOfData } = data;

  const updatePayload: Partial<Omit<RecurringTaskSupabase, 'id' | 'createdat' | 'userid'>> & { updatedat: string } = {
    ...restOfData,
    updatedat: new Date().toISOString(),
  };

  if (dueDate !== undefined) {
    updatePayload.duedate = dueDate || null;
  }

  if (completedAt !== undefined) {
    updatePayload.completedat = completedAt || null;
  }
  
  // userId is used for the .eq condition and should not be in the update payload
  // id, createdat are also not updatable here.

  console.log(`Updating recurring task ${taskId} for user ${userId} with data:`, updatePayload);
  const { data: updated, error, status, statusText } = await supabase
    .from('RecurringTask') // Ensure this table name matches your Supabase table
    .update(updatePayload as any) // Using 'as any' here temporarily if type issues persist with supabase client
    .eq('id', taskId)
    .eq('userid', userId)
    .select()
    .single(); // Assuming update returns a single record
  console.log('Supabase response from updateRecurringTask:', { data: updated, error, status, statusText });
  if (error) {
    console.error('Error updating recurring task:', error);
    throw error;
  }
  return updated;
}

export async function deleteRecurringTask(taskId: string, userId: string): Promise<void> {
  console.log(`Deleting recurring task ${taskId} for user ${userId}`);
  const { error, status, statusText } = await supabase
    .from('RecurringTask') // Ensure this table name matches your Supabase table
    .delete()
    .eq('id', taskId)
    .eq('userid', userId);
  console.log('Supabase response from deleteRecurringTask:', { error, status, statusText });
  if (error) {
    console.error('Error deleting recurring task:', error);
    throw error;
  }
}

export async function getUserRecurringTasks(userId: string): Promise<RecurringTaskSupabase[]> {
  console.log(`Fetching recurring tasks for userId: ${userId}`);
  const { data, error, status, statusText } = await supabase
    .from('RecurringTask') // Ensure this table name matches your Supabase table
    .select('*')
    .eq('userid', userId)
    .order('updatedat', { ascending: false });

  console.log('Supabase response from getUserRecurringTasks:', { data, error, status, statusText });

  if (error) {
    console.error('Error fetching user recurring tasks:', error);
    throw error;
  }
  console.log('Recurring tasks fetched for user:', data);
  return data || [];
}
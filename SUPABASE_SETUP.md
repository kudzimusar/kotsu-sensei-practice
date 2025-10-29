# Supabase Setup Instructions

## Step 1: Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name
   - Database password (save this!)
   - Region (choose closest to your users)
5. Wait for project to provision (~2 minutes)

## Step 2: Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `database_setup.sql` file
4. Paste into the SQL Editor
5. Click **Run** or press `Ctrl+Enter`
6. Verify all tables were created in **Table Editor**

You should see these tables:
- profiles
- user_roles
- quiz_progress
- category_performance
- study_events
- test_history

## Step 3: Get Your API Credentials

1. In Supabase dashboard, go to **Project Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy these two values:
   - **Project URL**
   - **anon public** key

## Step 4: Configure Your Project

Create a `.env` file in your project root and add:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

⚠️ **Important:** Never commit the `.env` file to version control!

## Step 5: Disable Email Confirmation (Optional - for testing)

1. Go to **Authentication** > **Providers** > **Email**
2. Toggle off "Confirm email"
3. This allows instant login during development

## What Was Set Up

### Tables Created:
- **profiles**: User profile data (name, exam date)
- **user_roles**: User role management (admin, moderator, user)
- **quiz_progress**: Save/resume quiz sessions
- **category_performance**: Track performance by question category
- **study_events**: Calendar events (lessons, tests, classes)
- **test_history**: Completed test results

### Security:
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Secure role-based access control
- ✅ Auto-profile creation on signup

### Features:
- ✅ Auto-syncing across devices
- ✅ Real-time data persistence
- ✅ Automatic timestamps
- ✅ Cascading deletes (data cleanup on user deletion)

## Next Steps

Once you've completed the setup above, let me know and I'll:
1. Update all frontend components to use Supabase
2. Add authentication (login/signup)
3. Replace localStorage with database calls
4. Add real-time syncing

## Troubleshooting

**Can't see tables?** 
- Make sure the SQL migration ran without errors
- Check the SQL Editor for error messages

**Environment variables not working?**
- Restart your development server after adding `.env`
- Make sure variable names start with `VITE_`

**RLS Policy errors?**
- Ensure user is authenticated before accessing data
- Check that `user_id` matches `auth.uid()` in queries

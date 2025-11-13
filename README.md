# Kōtsū Sensei - Japan Driving Test Practice

A comprehensive Progressive Web App (PWA) designed to help learners prepare for Japan's driving license examinations. Master traffic rules, road signs, and driving scenarios through interactive quizzes, AI-powered learning tools, and structured curriculum.

**Live URL**: https://kudzimusar.github.io/kotsu-sensei-practice/

## 🎯 Target Audience

- **International residents** in Japan preparing for their driving license exam
- **Learner's permit** candidates studying for the written test
- **Standard license** applicants preparing for the comprehensive exam
- **Driving school students** looking for additional practice and study materials
- **Anyone** seeking to understand Japanese traffic rules and road signs

## ✨ Key Features

### 📚 Study & Practice
- **Interactive Quizzes**: Practice with 250+ questions covering all exam categories
- **Multiple Quiz Modes**:
  - Quick Practice (10 questions, 6 minutes)
  - Focused Study (20 questions, 12 minutes)
  - Learner's Permit Test (50 questions, 30 minutes)
  - Driver's License Test (100 questions, 50 minutes)
- **Category-Based Practice**: Focus on specific topics (traffic rules, road signs, parking, etc.)
- **Weak Area Identification**: AI-powered analysis of your performance to highlight areas needing improvement
- **Question Images**: Visual road signs and scenario images with zoom functionality
- **Progress Tracking**: Save and resume quizzes, track completion rates
- **Retry Failed Questions**: Focus on questions you got wrong

### 🤖 AI-Powered Learning
- **AI Chatbot**: Get instant answers to questions about Japanese driving rules
- **AI Question Generator**: Generate custom practice questions based on specific concepts
- **Smart Explanations**: Detailed explanations for each question with context
- **Personalized Learning**: Adaptive question selection based on your performance

### 📖 Curriculum & Lectures
- **26 Structured Lectures**: Complete curriculum covering all exam topics
- **Textbook Content**: Comprehensive study materials with visual aids
- **Lecture Scheduling**: Plan and track your study schedule
- **Progress Tracking**: Monitor completion of lectures and materials
- **Auto-completion**: Past lectures automatically marked as completed

### 📅 Schedule Management
- **Driving School Schedule**: Manage your driving lessons and classes
- **Monthly Calendar View**: Visual grid showing all scheduled events
- **Event Types**: Categorize events (driving practice, theory class, exam, etc.)
- **Holiday Integration**: Japanese holidays automatically blocked
- **Template Loading**: Pre-populated schedule templates for quick setup
- **Event Management**: Add, edit, delete, and mark events as completed

### 📊 Performance Analytics
- **Category Performance**: Track accuracy by question category
- **Test History**: View all completed tests with scores and timestamps
- **Study Streaks**: Track consecutive days of study activity
- **Statistics Dashboard**: Comprehensive overview of your progress
- **Visual Charts**: Performance trends and progress visualization

### 🎯 Goals & Planning
- **Exam Date Tracking**: Set your target exam date and see countdown
- **Study Goals**: Set and track daily/weekly study goals
- **Progress Visualization**: Visual progress bars and completion percentages
- **Achievement Tracking**: Monitor milestones and accomplishments

### 👤 User Profile & Settings
- **User Authentication**: Secure sign-up and login with Supabase
- **Guest Mode**: Try the app without creating an account
- **Profile Management**: Update name, exam date, and preferences
- **Settings**: Customize app behavior, notifications, and preferences
- **Data Sync**: Automatic synchronization across devices

### 📱 Progressive Web App (PWA)
- **Offline Support**: Works offline with cached content
- **Installable**: Add to home screen on mobile and desktop
- **Fast Loading**: Optimized performance with service workers
- **Mobile-First Design**: Responsive UI optimized for all screen sizes

### 🛍️ Shop & Earn (Affiliate System)
- **Referral Program**: Earn rewards by referring friends
- **Affiliate Tracking**: Track clicks and conversions
- **Rewards System**: Earn points and benefits

## 🛠️ Technologies Used

### Frontend
- **Vite**: Fast build tool and development server
- **React 18**: Modern UI library with hooks
- **TypeScript**: Type-safe development
- **React Router**: Client-side routing
- **TanStack Query**: Data fetching and caching

### UI & Styling
- **shadcn/ui**: High-quality component library
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Recharts**: Data visualization

### Backend & Database
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Edge Functions
  - Storage for images

### Additional Libraries
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **date-fns**: Date manipulation
- **React Markdown**: Markdown rendering
- **vite-plugin-pwa**: PWA support

## 📁 Project Structure

```
kotsu-sensei-practice/
├── public/
│   ├── assets/              # Images, icons, screenshots
│   ├── questions.json       # Static question data
│   └── manifest.json        # PWA manifest
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── BottomNav.tsx   # Navigation bar
│   │   ├── QuizHome.tsx    # Quiz selection screen
│   │   ├── QuizQuestion.tsx # Question display
│   │   ├── QuizResults.tsx  # Results screen
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Home/Quiz page
│   │   ├── Study.tsx       # Study dashboard
│   │   ├── Tests.tsx      # Test history
│   │   ├── Lectures.tsx    # Curriculum & lectures
│   │   ├── Planner.tsx     # Schedule management
│   │   ├── Profile.tsx     # User profile
│   │   ├── AIChatbot.tsx   # AI assistant
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and helpers
│   │   ├── supabase/      # Supabase queries
│   │   └── queries/        # React Query hooks
│   ├── data/              # Static data
│   ├── types/             # TypeScript types
│   └── integrations/      # External integrations
├── supabase/
│   ├── functions/         # Edge Functions
│   └── migrations/        # Database migrations
└── scripts/               # Utility scripts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **bun** package manager
- **Supabase account** (for backend services)

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd kotsu-sensei-practice
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the database migrations (see `SUPABASE_SETUP.md`)
   - Configure authentication providers
   - Set up storage buckets for images

5. **Start the development server**
```bash
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:5173`

### Development Workflow

**Using your preferred IDE**
- Clone the repository
- Install dependencies with `npm install`
- Start the dev server with `npm run dev`
- Make changes and see them hot-reload automatically

**Using GitHub Codespaces**
- Navigate to your repository on GitHub
- Click "Code" → "Codespaces" → "New codespace"
- Edit files directly in the browser
- Commit and push changes when done

**Editing directly on GitHub**
- Navigate to any file
- Click the "Edit" button (pencil icon)
- Make changes and commit

## 🏗️ Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

Preview the production build:
```bash
npm run preview
```

## 🚢 Deployment

This project is deployed on **GitHub Pages**. 

### Automatic Deployment
- Push changes to the `main` branch
- GitHub Actions automatically builds and deploys the app
- The app is available at: `https://kudzimusar.github.io/kotsu-sensei-practice/`

### Manual Deployment
1. Build the project: `npm run build`
2. Configure GitHub Pages to serve from the `dist` folder
3. Or use a service like Vercel, Netlify, or Cloudflare Pages

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🗄️ Database Schema

The app uses Supabase (PostgreSQL) with the following main tables:
- `profiles` - User profile information
- `quiz_progress` - Save/resume quiz sessions
- `category_performance` - Performance tracking by category
- `test_history` - Completed test results
- `study_events` - Calendar events
- `driving_school_schedule` - Driving lesson schedule
- `curriculum` - Lecture progress tracking
- `ai_generated_questions` - AI-generated practice questions
- `lesson_materials` - Study materials and textbooks

See `SUPABASE_SETUP.md` for detailed database setup instructions.

## 🔐 Authentication

- **Email/Password**: Standard authentication
- **Guest Mode**: Try the app without signing up
- **Session Management**: Automatic session persistence
- **Protected Routes**: Certain features require authentication

## 📱 PWA Features

- **Offline Support**: Works without internet connection
- **Install Prompt**: Can be installed on mobile and desktop
- **Service Worker**: Caches assets and API responses
- **App Icons**: Multiple sizes for different devices
- **Manifest**: Full PWA manifest configuration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available for educational purposes.

## 📞 Support

For support, questions, or feedback:
- Open an issue on GitHub
- Contact through the in-app Support page
- Visit the About page for more information

## 🎓 Learning Resources

- **250+ Practice Questions**: Comprehensive question bank
- **Visual Road Signs**: Real Japanese traffic signs with explanations
- **Scenario Images**: Real-world driving scenarios
- **Structured Curriculum**: 26 lectures covering all topics
- **AI Explanations**: Detailed explanations for every question

## 🔄 Recent Updates

- ✅ AI-powered question generation
- ✅ Driving school schedule management
- ✅ Curriculum and lecture tracking
- ✅ Performance analytics dashboard
- ✅ PWA support with offline functionality
- ✅ Guest mode for trial users
- ✅ Image preloading for better performance
- ✅ Auto-completion of past events and lectures

---

**Made with ❤️ for learners preparing for Japan's driving license exam**

# Matrix - AI-Powered Career Companion

A comprehensive career development platform that leverages artificial intelligence to help professionals build resumes, prepare for interviews, and advance their careers.

## Live Demo

🚀 **[View Live Demo](https://your-demo-url.com)** *(Coming Soon)*

## About The Project

Matrix is an innovative career development platform designed to revolutionize how professionals approach job searching and career growth. The application addresses the common challenges faced by job seekers: creating compelling resumes that pass ATS systems, preparing effectively for technical interviews, and staying informed about industry trends and opportunities.

Built with modern web technologies and powered by Google's Gemini AI, Matrix provides personalized career guidance, generates industry-specific interview questions, creates ATS-optimized resumes, and offers real-time insights into market trends. The platform serves as a comprehensive career companion, helping users navigate their professional journey with confidence and data-driven insights.

## Key Features

- **🤖 AI-Powered Resume Builder**: Create professional, ATS-optimized resumes with intelligent content suggestions and formatting
- **📝 Smart Cover Letter Generator**: Generate personalized cover letters tailored to specific job applications
- **🎯 Interview Preparation**: Practice with AI-generated technical questions specific to your industry and role
- **📊 Performance Analytics**: Track your interview performance with detailed statistics and improvement recommendations
- **🏢 Industry Insights**: Access real-time market data, salary ranges, and industry trends
- **📈 Progress Tracking**: Monitor your career development journey with comprehensive analytics
- **🔐 Secure Authentication**: Built-in user management with Clerk authentication
- **📱 Responsive Design**: Fully responsive interface that works seamlessly across all devices
- **🌙 Dark Mode Support**: Modern UI with dark/light theme switching
- **📄 PDF Export**: Download your resumes as professional PDF documents

## Tech Stack

### Frontend
- **Next.js 15.5.0** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **MDEditor** - Markdown editor for content creation

### Backend & Database
- **Prisma 6.15.0** - Database ORM
- **PostgreSQL** - Primary database
- **Next.js API Routes** - Server-side API endpoints
- **Inngest** - Background job processing

### Authentication & AI
- **Clerk** - User authentication and management
- **Google Generative AI (Gemini)** - AI-powered content generation
- **Google Gemini 1.5 Flash** - Advanced language model

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **Turbopack** - Fast bundler for development

### Additional Libraries
- **html2pdf.js** - PDF generation
- **date-fns** - Date manipulation
- **Recharts** - Data visualization
- **Sonner** - Toast notifications
- **React Spinners** - Loading indicators

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** v18.x or later
- **npm** v9.x or later (comes with Node.js)
- **PostgreSQL** database
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/matrix.git
   cd matrix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   ```

4. **Environment Variables**

   Create a `.env.local` file in the root directory and add the following variables:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/matrix_db"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

   # Google Gemini AI
   GEMINI_API_KEY="your_gemini_api_key"

   # Inngest (Optional - for background jobs)
   INNGEST_EVENT_KEY="your_inngest_event_key"
   INNGEST_SIGNING_KEY="your_inngest_signing_key"
   ```

   **Environment Variables Explanation:**
   - `DATABASE_URL`: PostgreSQL connection string for your database
   - `NEXT_PUBLIC_CLERK_*`: Clerk authentication configuration
   - `GEMINI_API_KEY`: Google Gemini API key for AI features
   - `INNGEST_*`: Background job processing (optional)

5. **How to Run**

   Start the development server:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

   **Available Scripts:**
   - `npm run dev` - Start development server with Turbopack
   - `npm run build` - Build the application for production
   - `npm run start` - Start production server
   - `npm run lint` - Run ESLint for code quality

## Project Structure

```
matrix/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   ├── (main)/                   # Main application pages
│   │   ├── dashboard/            # User dashboard
│   │   ├── resume/               # Resume builder
│   │   ├── ai-cover-letter/      # Cover letter generator
│   │   ├── interview/            # Interview preparation
│   │   └── onboarding/           # User onboarding
│   ├── api/                      # API routes
│   └── lib/                      # Utility functions
├── components/                   # Reusable UI components
├── actions/                      # Server actions
├── hooks/                        # Custom React hooks
├── lib/                          # Shared libraries
├── prisma/                       # Database schema and migrations
└── public/                       # Static assets
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.


---

**Made by Anshul Sharma**

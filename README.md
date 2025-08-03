# L'Negdi Tamid - Audio Classes Website

A modern, responsive React application for hosting and streaming audio classes with admin panel, authentication, and cloud storage integration.

## Features

- 🎵 **Streaming Audio Player**: Sticky player at bottom with full controls
- 👤 **Admin Authentication**: Secure login system for content management
- ☁️ **Cloud Storage**: Files stored on Supabase with CDN delivery
- 🔍 **Search & Filter**: Search by title, description, or tags
- 📱 **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- 🏷️ **Tag System**: Organize classes with custom tags and smart tag selection
- 🔐 **Row Level Security**: Secure data access with Supabase RLS
- 🎨 **Modern UI**: Built with React and Tailwind CSS

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (Database + Storage + Auth)
- **Routing**: React Router
- **State Management**: React hooks and context
- **Audio**: HTML5 Audio API with custom React components
- **Font**: Google Fonts (Manrope)

## Setup Instructions

### 1. Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Supabase Configuration

#### A. Get Your Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project or create a new one
3. Go to Settings → API
4. Copy your Project URL and Anon Public Key

#### B. Update Environment Variables
1. Copy `.env.example` to `.env`
2. Replace the values with your actual Supabase credentials:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Database Setup

#### A. Run Database Schema
1. Go to Supabase SQL Editor
2. Copy and paste the contents of `database/supabase-schema.sql`
3. Execute the script

#### B. Setup Storage Bucket
1. Copy and paste the contents of `database/supabase-storage-setup.sql`
2. Execute the script in SQL Editor

### 4. Authentication Setup

#### A. Enable Email Authentication
1. Go to Authentication → Settings
2. Enable Email authentication provider
3. Configure your site URL (e.g., `http://localhost:5173` for development)

#### B. Create Admin User
1. Go to Authentication → Users
2. Click "Add User"
3. Create an admin account with email/password

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Project Structure

```
├── src/
│   ├── components/          # Reusable React components
│   │   ├── AudioPlayer.jsx  # Main audio player component
│   │   ├── Header.jsx       # Site header with navigation
│   │   ├── Modal.jsx        # Modern modal component
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js       # Authentication hook
│   │   ├── useAudioClasses.js # Audio classes data hook
│   │   ├── useModal.js      # Modal state management
│   │   └── useFileUpload.js # File upload utilities
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Main classes listing page
│   │   └── Admin.jsx        # Admin panel with tabs
│   ├── lib/
│   │   └── supabase.js      # Supabase client configuration
│   └── utils/               # Utility functions
├── database/                # SQL files and database scripts
├── public/                  # Static assets
├── .mcp.json               # MCP configuration for development
├── package.json            # Node.js dependencies and scripts
└── vite.config.js          # Vite configuration
```

## Usage

### For Visitors
- Browse audio classes on the main page
- Use search and tag filters to find specific content
- Click "Play" on any class to start streaming
- Use the sticky player controls at bottom

### For Admins
1. Click "Sign in" and enter your credentials
2. Access admin tabs (Upload, Manage, Analytics) after login
3. **Upload**: Add new audio files with smart tag selection
4. **Manage**: Edit or delete existing classes
5. **Analytics**: View usage statistics and storage info

## Features Detail

### Tag System
- **Smart Tag Selection**: Choose from existing tags to avoid duplicates
- **Custom Tags**: Add new tags as needed
- **Tag Filtering**: Filter classes by multiple tags on home page

### Audio Player
- **Sticky Position**: Stays at bottom during navigation
- **Full Controls**: Play, pause, seek, volume
- **Track Info**: Shows current track title and progress
- **Playlist**: Automatically queues filtered results

### Admin Panel
- **Upload Tab**: File upload with metadata and tag selection
- **Manage Tab**: Bulk operations and individual class editing
- **Analytics Tab**: Storage usage and activity statistics

## Security Features

- **Row Level Security**: Users can only modify their own content
- **Authentication**: Admin features require login
- **File Organization**: Files stored in user-specific folders
- **Public Access**: Audio files publicly accessible but database secured

## Supported Audio Formats

- MP3 (.mp3)
- WAV (.wav)
- M4A (.m4a)
- Maximum file size: 50MB per audio file

## Deployment

### Vercel (Recommended)
1. Push to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Netlify
1. Connect GitHub repository to Netlify
2. Add environment variables in Netlify settings
3. Deploy with build command: `npm run build`

### Other Platforms
1. Build the project: `npm run build`
2. Upload `dist/` folder contents to your hosting provider
3. Configure environment variables on your platform

## Troubleshooting

### Common Issues

**"Failed to load classes"**
- Check if database schema is properly set up
- Verify environment variables in `.env`
- Check browser console for specific errors

**Authentication not working**
- Verify email provider is enabled in Supabase
- Check site URL configuration in Supabase Auth settings
- Ensure admin user exists

**File upload fails**
- Check storage bucket exists and is public
- Verify file size is under 50MB
- Check supported file formats

**Audio won't play**
- Ensure file uploaded successfully to storage
- Check browser console for CORS errors
- Verify file URL is accessible

## Development with MCP

The project includes `.mcp.json` for development with Supabase MCP server:
- Database queries and management
- Storage operations
- Real-time development assistance

## License

This project is created for L'Negdi Tamid educational purposes.
# L'Negdi Tamid - Audio Classes Website

A modern, responsive website for hosting and streaming audio classes with admin panel, authentication, and cloud storage integration.

## Features

- 🎵 **Streaming Audio Player**: Sticky player at bottom with full controls
- 👤 **Admin Authentication**: Secure login system for content management
- ☁️ **Cloud Storage**: Files stored on Supabase with CDN delivery
- 🔍 **Search & Filter**: Search by title, description, or tags
- 📱 **Responsive Design**: Mobile-friendly interface
- 🏷️ **Tag System**: Organize classes with custom tags
- 🔐 **Row Level Security**: Secure data access with Supabase RLS

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Supabase (Database + Storage + Auth)
- **Styling**: Custom CSS with L'Negdi Tamid branding
- **Audio**: HTML5 Audio API with custom controls

## Setup Instructions

### 1. Supabase Configuration

#### A. Get Your Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `orkpwvjghccvcopzahez`
3. Go to Settings → API
4. Copy your Project URL and Anon Public Key

#### B. Update Configuration
1. Open `supabase-config.js`
2. Replace `YOUR_SUPABASE_ANON_KEY_HERE` with your actual anon key
3. The project URL is already set to: `https://orkpwvjghccvcopzahez.supabase.co`

### 2. Database Setup

#### A. Run Database Schema
1. Go to Supabase SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Execute the script

#### B. Setup Storage Bucket
1. Copy and paste the contents of `supabase-storage-setup.sql`
2. Execute the script in SQL Editor

### 3. Authentication Setup

#### A. Enable Email Authentication
1. Go to Authentication → Settings
2. Enable Email authentication provider
3. Configure your site URL (e.g., `http://localhost:3000` for development)

#### B. Create Admin User
1. Go to Authentication → Users
2. Click "Add User"
3. Create an admin account with email/password

### 4. Local Development

#### Option 1: Simple HTTP Server (Python)
```bash
# Navigate to project directory
cd /path/to/your/project

# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

#### Option 2: Node.js HTTP Server
```bash
# Install serve globally
npm install -g serve

# Serve the project
serve -s . -l 3000
```

#### Option 3: PHP Server
```bash
php -S localhost:3000
```

### 5. Testing the Setup

1. Open `http://localhost:3000` in your browser
2. You should see the L'Negdi Tamid website
3. Click "Login" to access admin features
4. Use your Supabase admin credentials
5. Upload a test audio file through the admin panel

## File Structure

```
lenegdi/
├── index.html              # Main website HTML
├── styles.css              # Website styling
├── script.js               # Main application logic
├── supabase-config.js      # Supabase configuration
├── supabase-schema.sql     # Database schema
├── supabase-storage-setup.sql # Storage configuration
├── .mcp.json              # MCP configuration for development
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## Usage

### For Visitors
- Browse audio classes on the main page
- Use search and tag filters to find specific content
- Click "Play" on any class to start streaming
- Use the sticky player controls at bottom

### For Admins
1. Click "Login" and enter your credentials
2. Access the Admin Panel after successful login
3. Upload new audio files with metadata:
   - Title (required)
   - Description (optional)
   - Tags (comma-separated)
4. Manage your uploaded classes
5. Delete classes as needed

## Security Features

- **Row Level Security**: Users can only modify their own content
- **Authentication**: Admin features require login
- **File Organization**: Files stored in user-specific folders
- **Public Access**: Audio files publicly accessible but database secured

## Supported Audio Formats

- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)
- M4A (.m4a)
- AAC (.aac)
- FLAC (.flac)

## File Size Limits

- Maximum file size: 50MB per audio file
- Storage organized by user ID for better organization

## Development

### MCP Integration
The project includes `.mcp.json` for development with Supabase MCP server:
- Database queries and management
- Storage operations
- Real-time development assistance

### Adding Features
- All database changes should update `supabase-schema.sql`
- Storage policies are in `supabase-storage-setup.sql`
- Frontend logic is in `script.js`
- Styling follows the existing L'Negdi Tamid brand guidelines

## Deployment

### Option 1: GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Update Supabase site URL to your GitHub Pages URL

### Option 2: Netlify/Vercel
1. Connect your GitHub repository
2. Deploy with default build settings
3. Update Supabase site URL to your deployment URL

### Option 3: Traditional Web Hosting
1. Upload all files to your web server
2. Ensure HTTPS is enabled
3. Update Supabase site URL accordingly

## Troubleshooting

### Common Issues

**"Failed to load classes"**
- Check if database schema is properly set up
- Verify Supabase configuration in `supabase-config.js`
- Check browser console for specific errors

**Authentication not working**
- Verify email provider is enabled in Supabase
- Check site URL configuration
- Ensure admin user exists

**File upload fails**
- Check storage bucket exists and is public
- Verify file size is under 50MB
- Check supported file formats

**Audio won't play**
- Ensure file uploaded successfully to storage
- Check browser console for CORS errors
- Verify file URL is accessible

### Getting Help

1. Check browser developer console for errors
2. Verify Supabase dashboard for data/storage issues
3. Test with smaller audio files first
4. Check network tab for failed requests

## License

This project is created for L'Negdi Tamid educational purposes.
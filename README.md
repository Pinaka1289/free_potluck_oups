# 🎉 PotluckParty - Free Potluck Event Organizer

A beautiful, fully responsive web application for organizing potluck events. Create and share events without signing up, manage items in real-time, and let guests claim what they're bringing!

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

## ✨ Features

### No Sign-up Required
- **Create events instantly** - Just fill in the details and get a shareable link
- **Guest-friendly** - Anyone with the link can add or update items
- **Bookmark to save** - No account needed for basic features

### For Registered Users
- **Personal dashboard** - Manage all your events in one place
- **Event ownership** - Link events to your account
- **Quick access** - Never lose your event links again

### Core Features
- 📅 **Event Details** - Date, time, location, and host information
- 🍽️ **Item Management** - Add, edit, delete, and claim items
- 📂 **Categories** - Organize items by type (appetizers, mains, desserts, etc.)
- 🔗 **Easy Sharing** - One-click copy link functionality
- 🌓 **Dark/Light Mode** - Choose your preferred theme (dark mode default)
- 📱 **Fully Responsive** - Works beautifully on all devices
- ⚡ **Real-time Updates** - See changes as they happen

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works great!)

### 1. Clone and Install

```bash
cd free_potluck_oups
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Project Settings > API** and copy your:
   - Project URL
   - Anon/Public key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── create/            # Create event page
│   ├── dashboard/         # User dashboard
│   ├── event/[slug]/      # Event detail page
│   └── page.tsx           # Homepage
├── components/
│   ├── layout/            # Header, Footer, ThemeToggle
│   └── ui/                # Reusable UI components
├── context/               # React contexts (Theme)
├── lib/
│   ├── supabase/          # Supabase client configuration
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript types
```

## 🗄️ Database Schema

### Events Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | TEXT | Unique URL identifier |
| title | TEXT | Event name |
| description | TEXT | Event description |
| event_date | DATE | Date of the event |
| event_time | TIME | Time of the event |
| location | TEXT | Event location |
| host_name | TEXT | Host's name |
| host_email | TEXT | Host's email |
| user_id | UUID | Link to user (optional) |

### Items Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_id | UUID | Foreign key to events |
| name | TEXT | Item name |
| category | TEXT | Item category |
| quantity | INTEGER | Number of items |
| brought_by | TEXT | Person bringing the item |
| notes | TEXT | Additional notes |
| claimed | BOOLEAN | Whether item is claimed |

### Profiles Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (from auth.users) |
| email | TEXT | User's email |
| full_name | TEXT | User's full name |
| avatar_url | TEXT | Profile picture URL |

## 🎨 Customization

### Theme Colors
Edit the CSS variables in `src/app/globals.css`:
- Primary: Orange (`#e87422`)
- Accent: Coral (`#e15f4f`)
- Sage: Green accents

### Categories
Edit `ITEM_CATEGORIES` in `src/lib/utils.ts` to customize potluck item categories.

## 📱 Screenshots

The app features:
- Beautiful hero section with gradient accents
- Responsive grid layouts
- Smooth animations with Framer Motion
- Clean card-based UI
- Intuitive forms and modals

## 🛠️ Built With

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Styling
- **[Supabase](https://supabase.com/)** - Backend & Database
- **[Framer Motion](https://www.framer.com/motion/)** - Animations
- **[Lucide React](https://lucide.dev/)** - Icons

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

Made with ❤️ for potluck lovers everywhere

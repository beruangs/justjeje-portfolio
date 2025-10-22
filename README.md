# 🎬 Just-Jeje Portfolio Website

Modern, fast, and easy-to-manage portfolio website for **Just-Jeje** - Video Editor & Videographer.

![React](https://img.shields.io/badge/React-19.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-7.1.11-purple)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan)
![Framer Motion](https://img.shields.io/badge/FramerMotion-12.23-pink)

## ✨ Features

- 🚀 **Lightning Fast** - Built with Vite for optimal performance
- 📱 **Fully Responsive** - Mobile-first design, works on all devices
- 🎨 **Modern UI/UX** - Smooth animations with Framer Motion
- 📝 **JSON-based CMS** - Easy content management without touching code
- 🎥 **YouTube Integration** - Embedded video player for portfolio items
- 🔍 **Smart Filtering** - Filter projects by Film, Commission, Non-Commission
- 🎯 **SEO Optimized** - Meta tags, Open Graph, Twitter Cards, JSON-LD structured data
- ⚡ **Fast Loading** - Optimized images and lazy loading
- 📊 **Dynamic Stats** - Auto-calculated years of experience and project count
- 🗺️ **Sitemap** - XML sitemap for better search engine indexing

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
```bash
cd justjeje-web
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

The production files will be generated in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
justjeje-web/
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Header.jsx      # Navigation & sidebar
│   │   ├── Hero.jsx        # Landing section
│   │   ├── About.jsx       # About section with stats
│   │   ├── Skills.jsx      # Skills progress bars
│   │   ├── Gear.jsx        # Equipment showcase
│   │   ├── Portfolio.jsx   # Portfolio grid with filters
│   │   └── Footer.jsx      # Footer component
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Main homepage
│   │   └── ProjectDetail.jsx  # Individual project page
│   ├── data/               # JSON data files
│   │   ├── profile.json    # Personal info & skills
│   │   └── portfolio.json  # All portfolio projects
│   ├── App.jsx             # Main app with routing
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies & scripts
```

## 📝 How to Add New Portfolio Items

**This is the easiest way to manage your portfolio!** You only need to edit ONE file.

### Step 1: Open `src/data/portfolio.json`

### Step 2: Add your new project to the array:

```json
{
  "id": "your-project-id",
  "title": "Your Project Title",
  "date": "Month, Year",
  "category": "film",
  "thumbnail": "https://your-image-url.com/thumbnail.png",
  "youtubeUrl": "https://youtu.be/VIDEO_ID",
  "description": "Brief description of your project"
}
```

### Field Descriptions:

- **id**: Unique identifier (use lowercase with hyphens, e.g., "my-new-project")
- **title**: Project name (e.g., "Film WeB", "Wedding Aulia & Ramadhan")
- **date**: Format: "Month, Year" (e.g., "Mar, 2024")
- **category**: Choose one:
  - `"film"` - For short films and movies
  - `"commission"` - For paid client work
  - `"non-commission"` - For personal/creative projects
- **thumbnail**: Direct URL to thumbnail image
- **youtubeUrl**: YouTube video link
- **description**: Short project description
- **pinned**: Pin project to top of list
  - `"yes"` - Project will appear first with yellow badge
  - `""` (empty) - Normal project order (default)
- **detailPage** (optional): External project website link
- **projectInfo** (optional): Detailed project information
  - **name**: Full project name
  - **categoryFull**: Full category description (e.g., "Short Film", "Wedding Video")
  - **role**: Your role in the project (e.g., "Producer, Editor, Colorist")
  - **fest**: Film festival participation (use "-" if none)

### 📌 How to Pin a Project

To pin a project to the top of your portfolio (appears first with a yellow "PINNED" badge):

1. Open `src/data/portfolio.json`
2. Find the project you want to pin
3. Set `"pinned": "yes"`

Example:
```json
{
  "id": "batwoska-memories",
  "title": "The Batwoska 25's Memories",
  "pinned": "yes",
  ...
}
```

Pinned projects will always appear first, regardless of the filter (Film/Commission/Non-Commission).

### Step 3: Save the file

That's it! The website will automatically:
- ✅ Display your new project on the homepage
- ✅ Create a detail page at `/project/your-project-id`
- ✅ Make it filterable by category
- ✅ Embed the YouTube video

## 🎨 How to Update Profile Information

Edit `src/data/profile.json` to update:

- Personal information (name, age, city, etc.)
- Contact links (Instagram, YouTube, TikTok, WhatsApp, Email)
- Stats (years of experience, projects, events)
- Skills and their levels
- Gear/equipment

```json
{
  "fullname": "Your Full Name",
  "nickname": "Your Nickname",
  "title": "Your Title",
  "about": "Your bio...",
  "contact": {
    "instagram": "your-url",
    "youtube": "your-url",
    ...
  },
  "skills": [
    { "name": "Skill Name", "level": 100 }
  ],
  "gear": [
    { "name": "Equipment", "type": "Type", "image": "url" }
  ]
}
```

## 🎯 Key Features Explained

### 1. Automatic Routing
No need to create HTML files for each project. The app automatically generates routes like:
- `/` - Homepage
- `/project/film-apus` - Project detail page

### 2. YouTube Integration
Simply paste any YouTube URL format, and it will automatically embed:
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/watch?v=VIDEO_ID`

### 3. Smart Filtering
Visitors can filter your portfolio by:
- All projects
- Films only
- Commission work
- Non-commission (personal) projects

### 4. Mobile-First Design
The website looks great on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktop computers

## 🛠️ Tech Stack

- **React 19.2** - UI library
- **Vite 7.1** - Build tool (super fast!)
- **React Router 7.9** - Routing
- **Framer Motion 12.23** - Animations
- **Tailwind CSS 3.4** - Styling
- **PostCSS** - CSS processing

## 🎨 Color Theme

The website uses a dark theme with:
- **Primary**: `#3a4672` (Dark blue)
- **Secondary**: `#506dff` (Bright blue)
- **Dark**: `#202b4b` (Background)
- **Light**: `#d1d4d6` (Text)

You can customize these in `tailwind.config.js`.

## 📊 Performance

- ⚡ Fast initial load
- 🎯 Optimized bundle size
- 📱 Mobile optimized
- 🖼️ Lazy loading images
- 🚀 Smooth animations

## 🚀 Deployment

### Deploy to Netlify (Recommended)

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Connect your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy!

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Vercel auto-detects Vite
5. Deploy!

## 📧 Support

For questions or issues, contact:
- Email: jentayubronto@gmail.com
- Instagram: @justjejee._

## 📄 License

Copyright © 2025 Just-Jeje. All rights reserved.

---

## 🎉 Congratulations!

You now have a modern, fast, and easy-to-manage portfolio website! 

**No more creating HTML files for each project** - just update the JSON file and you're done! 🎊

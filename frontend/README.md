# Yeka Sub City Library - Frontend

A modern, responsive web application for the Yeka Sub City Library built with React, TypeScript, and Tailwind CSS.

## 🌟 Features

### 🎨 Modern UI/UX
- **Clean and minimal design** with soft shadows and rounded corners
- **Dark/Light mode** toggle with system preference detection
- **Responsive design** that works seamlessly on desktop, tablet, and mobile
- **Smooth animations** and transitions using Framer Motion
- **Accessibility-first** approach with proper ARIA labels and keyboard navigation

### 🌐 Internationalization
- **Bilingual support** for English and Amharic
- **Language switcher** with persistent preference storage
- **RTL support** ready for future expansion
- **Localized content** including dates, numbers, and text

### 📱 Responsive Design
- **Mobile-first** approach with progressive enhancement
- **Collapsible navigation** for mobile devices
- **Touch-friendly** interface elements
- **Optimized performance** across all device types

### 🎯 User Features
- **Hero section** with engaging visuals and call-to-action
- **Advanced search** with category filtering
- **Featured books** carousel with ratings and availability
- **Interactive elements** with hover states and animations
- **Book favoriting** and user preferences

### 👨‍💼 Admin Dashboard
- **Comprehensive overview** with real-time statistics
- **Interactive charts** for data visualization
- **Recent activity** feed with live updates
- **Collapsible sidebar** navigation
- **Real-time notifications** and status indicators

## 🚀 Technology Stack

- **React 18** with TypeScript for type safety
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **React Router** for client-side routing
- **React i18next** for internationalization
- **Chart.js** for data visualization
- **Heroicons** for consistent iconography

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminLayout.tsx
│   │   │   └── Dashboard/
│   │   │       ├── DashboardOverview.tsx
│   │   │       ├── StatsCard.tsx
│   │   │       ├── ChartCard.tsx
│   │   │       └── RecentActivity.tsx
│   │   ├── common/
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── LanguageToggle.tsx
│   │   │   └── Footer.tsx
│   │   └── home/
│   │       ├── Header.tsx
│   │       ├── HeroSection.tsx
│   │       ├── SearchSection.tsx
│   │       └── FeaturedBooks.tsx
│   ├── contexts/
│   │   ├── ThemeContext.tsx
│   │   └── LanguageContext.tsx
│   ├── i18n/
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── en.json
│   │       └── am.json
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   └── admin/
│   │       └── AdminDashboard.tsx
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 🎨 Design System

### Color Palette
- **Primary**: Red (#ef4444) - Library brand color
- **Success**: Green (#22c55e) - Positive actions
- **Warning**: Amber (#f59e0b) - Caution states
- **Error**: Red (#ef4444) - Error states
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font Family**: Inter - Clean and readable
- **Font Weights**: 300, 400, 500, 600, 700, 800
- **Responsive sizing** with mobile-first approach

### Components
- **Cards**: Consistent shadow and border radius
- **Buttons**: Primary, secondary, and outline variants
- **Forms**: Accessible input fields with validation
- **Navigation**: Responsive with mobile-friendly design

## 🌐 Internationalization

The application supports English and Amharic languages:

- **English (en)**: Default language
- **Amharic (am)**: Ethiopian local language
- **Language switching**: Persistent user preference
- **Localized content**: All UI text and messages

## 📱 Responsive Breakpoints

- **xs**: 475px and up
- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up
- **2xl**: 1536px and up

## 🎯 Key Features

### Home Page
- **Hero section** with library introduction
- **Search functionality** with category filters
- **Featured books** carousel
- **Service highlights** and information
- **Footer** with contact information

### Admin Dashboard
- **Statistics overview** with key metrics
- **Interactive charts** for data visualization
- **Recent activity** feed
- **Navigation sidebar** with all admin functions
- **Real-time updates** and notifications

## 🔧 Configuration

### Theme Configuration
The theme system supports:
- **Light/Dark mode** toggle
- **System preference** detection
- **Persistent storage** of user choice
- **Smooth transitions** between themes

### Language Configuration
Internationalization features:
- **Dynamic language switching**
- **Persistent language preference**
- **Fallback to English** for missing translations
- **Number and date localization**

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your hosting platform**
   - The build folder contains all static assets
   - Configure your server to serve index.html for all routes
   - Set up proper caching headers for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **Heroicons** for beautiful icons
- **React community** for excellent tooling and libraries

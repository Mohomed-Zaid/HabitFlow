# Health & Wellness Habit Builder App - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from **productivity and wellness leaders** like Notion (clean organization), Headspace (calming wellness aesthetics), and Streaks (gamified habit tracking). This combines the organized efficiency of productivity tools with the motivational, health-focused visual language of wellness apps.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light mode: 142 71% 45% (calming sage green)
- Dark mode: 142 30% 25% (muted forest green)

**Accent Colors:**
- Success/streak: 120 60% 50% (vibrant green)
- Warning/missed: 25 85% 60% (warm orange)
- Background neutrals: 210 20% 98% (light) / 210 15% 12% (dark)

### B. Typography
- **Primary**: Inter (Google Fonts) - clean, readable for data-heavy interfaces
- **Display**: Poppins (Google Fonts) - friendly, motivational messaging
- **Hierarchy**: Regular body (16px), Medium headings (20px), Bold displays (32px)

### C. Layout System
**Tailwind Spacing**: Consistent use of 2, 4, 6, 8, 12, 16 units
- Cards: p-6, m-4
- Sections: py-12, px-4
- Component spacing: gap-4, space-y-6

### D. Component Library

**Navigation:**
- Bottom tab bar for mobile (Habits, Today, Progress, Profile)
- Clean sidebar for desktop with icon + label navigation

**Habit Tracking:**
- Card-based habit displays with large checkboxes
- Streak counters with animated number transitions
- Progress circles for completion percentages

**Data Visualization:**
- Minimalist line charts for habit trends
- Heat map calendars for consistency tracking
- Simple bar charts for weekly summaries

**AI Elements:**
- Distinct notification cards for AI nudges
- Gentle highlight borders for AI-suggested habits
- Motivational quote cards with soft background gradients

**Gamification:**
- Badge icons using Heroicons library
- Point counters with subtle animations
- Achievement unlocks with celebration micro-interactions

### E. Visual Treatments

**Gradients:**
- Subtle wellness gradients (sage to mint: 142 71% 45% to 158 65% 55%)
- Success celebrations (green to teal gradients)
- Background overlays with 142 20% 96% to 158 15% 98%

**Card Design:**
- Soft shadows (shadow-sm)
- Rounded corners (rounded-lg)
- Clean white/dark backgrounds with subtle borders

**Micro-interactions:**
- Checkbox completion with gentle bounce
- Streak number count-up animations
- Progress bar smooth fills (CSS transitions only)

## Key Design Principles

1. **Wellness-First Aesthetics**: Calming colors, breathing room, nature-inspired greens
2. **Data Clarity**: Clean typography hierarchy, organized information architecture
3. **Motivational Design**: Celebratory elements for achievements, encouraging AI messaging
4. **Mobile-Optimized**: Touch-friendly interfaces, thumb-zone navigation
5. **Consistent Spacing**: Predictable layout rhythm using defined Tailwind units

This approach balances the organizational efficiency needed for habit tracking with the motivational, wellness-focused visual language that encourages consistent engagement.
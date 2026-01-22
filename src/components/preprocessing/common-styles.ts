// Common styles and utilities for preprocessing components
// This ensures consistent styling across all preprocessing steps

export const commonStyles = {
  // Main container styles
  container: "w-full max-w-none mx-auto space-y-4",

  // Card styles
  card: {
    base: "border-0 shadow-sm bg-white/80 backdrop-blur-sm dark:bg-slate-800/80",
    header: "pb-3 px-4 py-3",
    content: "p-4",
    compact: "p-3"
  },

  // Header styles
  header: {
    title: "text-lg font-semibold text-slate-900 dark:text-slate-100",
    subtitle: "text-sm text-muted-foreground mt-1",
    badge: "px-2 py-0.5 text-xs"
  },

  // Grid layouts optimized for narrower sidebar
  grid: {
    twoColumns: "grid grid-cols-1 lg:grid-cols-2 gap-4",
    threeColumns: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3",
    fourColumns: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3",
    responsive: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
  },

  // Form styles
  form: {
    group: "space-y-2",
    label: "text-xs font-medium text-slate-700 dark:text-slate-300",
    input: "h-8 text-sm",
    select: "h-8 text-sm",
    checkbox: "h-4 w-4"
  },

  // Button styles
  button: {
    primary: "h-8 px-3 text-sm font-medium",
    secondary: "h-8 px-3 text-sm",
    icon: "h-8 w-8 p-0",
    compact: "h-7 px-2 text-xs"
  },

  // Method card styles
  methodCard: {
    base: "border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer",
    selected: "border-primary bg-primary/5",
    icon: "h-5 w-5 mb-2 text-primary",
    title: "text-sm font-medium mb-1",
    description: "text-xs text-muted-foreground line-clamp-2"
  },

  // Status styles
  status: {
    success: "flex items-center gap-1.5 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded-md border border-green-200 dark:border-green-800",
    error: "flex items-center gap-1.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded-md border border-red-200 dark:border-red-800",
    warning: "flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded-md border border-orange-200 dark:border-orange-800",
    info: "flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800"
  },

  // Table styles optimized for smaller screens
  table: {
    container: "border rounded-lg overflow-hidden",
    header: "bg-slate-50 dark:bg-slate-800/50",
    cell: "px-3 py-2 text-sm",
    headerCell: "px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
  },

  // Progress and loading styles
  progress: {
    container: "space-y-2",
    bar: "h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden",
    fill: "h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300",
    label: "flex items-center justify-between text-xs text-muted-foreground"
  },

  // Metric card styles
  metric: {
    container: "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700",
    header: "flex items-center justify-between mb-2",
    title: "text-xs font-medium text-slate-600 dark:text-slate-400",
    value: "text-lg font-bold text-slate-900 dark:text-slate-100",
    change: "text-xs text-muted-foreground",
    icon: "h-4 w-4 text-primary"
  },

  // Animation variants for framer-motion
  animations: {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 }
    },
    slideIn: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.3 }
    },
    staggerChildren: {
      animate: { transition: { staggerChildren: 0.1 } }
    }
  }
};

// Responsive breakpoints for different content areas
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px"
};

// Utility functions for common patterns
export const utils = {
  // Combine class names with proper spacing
  cn: (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(" ");
  },

  // Format file sizes
  formatFileSize: (bytes: number): string => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  },

  // Format duration
  formatDuration: (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  },

  // Truncate text
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  }
};

// Common layout components as style objects
export const layouts = {
  // Two-panel layout (method selection + configuration)
  twoPanelGrid: "grid grid-cols-1 xl:grid-cols-2 gap-4",

  // Three-panel layout (selection + config + preview)
  threePanelGrid: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4",

  // Stacked layout for mobile
  stackedLayout: "flex flex-col space-y-4",

  // Method grid optimized for narrow screens
  methodGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",

  // Stats grid
  statsGrid: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3",

  // Results layout
  resultsLayout: "space-y-4",

  // Navigation layout
  navLayout: "flex items-center justify-between",

  // Action bar layout
  actionBar: "flex items-center gap-2 flex-wrap"
};

// Color scheme for different preprocessing steps
export const colors = {
  missingValues: {
    primary: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800"
  },
  dataCleaning: {
    primary: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200 dark:border-green-800"
  },
  categoricalEncoding: {
    primary: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-800"
  },
  featureScaling: {
    primary: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-200 dark:border-orange-800"
  },
  featureSelection: {
    primary: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-950/20",
    border: "border-pink-200 dark:border-pink-800"
  },
  featureExtraction: {
    primary: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    border: "border-indigo-200 dark:border-indigo-800"
  },
  datasetSplitting: {
    primary: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/20",
    border: "border-teal-200 dark:border-teal-800"
  }
};

// Export default styles object
export default commonStyles;

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains two separate projects:

1. **Vue 3 Authentication Application** (`my-vue-app/`) - A modern web application with login and password recovery functionality
2. **Python M3U8 Downloader** (`main.py`) - A command-line utility for downloading and converting m3u8 video streams to mp4

## Vue 3 Application Development

### Development Commands
```bash
cd my-vue-app
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Architecture Overview
The Vue app follows modern Vue 3 patterns with Composition API:

- **Entry Points:**
  - `my-vue-app/src/main.js` - Vue app initialization
  - `my-vue-app/src/App.vue` - Root component with router view
  - `my-vue-app/src/router/index.js` - Route configuration

- **Component Structure:**
  - `src/components/Login.vue` - Login form with validation and API integration
  - `src/components/ForgotPassword.vue` - Password recovery with email validation
  - `src/mock/api.js` - Mock API service for development (simulates authentication flow)

- **Technology Stack:**
  - Vue 3.5.21 with Composition API (`<script setup>`)
  - Vue Router 4.0.0 for navigation
  - Vite 5.0.0 as build tool
  - Tailwind CSS 4.1.13 for styling
  - PostCSS with Autoprefixer

### Development Patterns
- Uses Composition API with `<script setup>` syntax
- Reactive form data with `ref()` for form inputs
- Mock API simulates authentication with realistic delays
- Token-based authentication stored in localStorage
- Proper error handling and loading states
- Responsive design with Tailwind CSS

## Python Utility

### M3U8 Video Downloader
The `main.py` script downloads m3u8 video streams and converts them to mp4 format using FFmpeg.

**Requirements:**
- FFmpeg must be installed system-wide (https://ffmpeg.org/download.html)
- Python standard library (os, shutil, subprocess)

**Usage:**
The script contains a hardcoded function call that downloads a specific Chinese video stream. For general use, modify the URL and output filename in the last line of the script.

**Architecture:**
- Single-file utility with dependency checking
- Uses subprocess to call FFmpeg for video processing
- Includes Chinese localization and error handling

## Key Development Notes

### Vue Application
- The app uses a mock API service, allowing development without backend dependencies
- Form validation is implemented client-side with proper error feedback
- Tailwind CSS is configured to scan Vue files for class usage
- VS Code with Vue Volar extension is recommended for optimal development experience

### Python Script
- The script currently has a hardcoded Chinese video URL as an example
- FFmpeg dependency checking prevents runtime errors
- The utility follows a simple, functional approach with proper error handling

## Working with Both Projects

When working in this repository, identify which component you're modifying:
- For web application work: Navigate to `my-vue-app/` directory
- For video processing: Work with `main.py` in the root directory

Both projects are independent and serve different purposes - the Vue app for modern web development, and the Python script for media processing workflows.
# 🛠️ Technology Stack Guide - Complete Reference

## Overview
Career Intelligence Platform uses a modern, scalable tech stack with three main layers:
- **Frontend**: Next.js 14 (React 18) with TypeScript
- **Backend**: Spring Boot 3.2 (Java 17)
- **ML Service**: FastAPI (Python 3.10+)

## Frontend Technologies

### Next.js 14.0.4
- React framework with server-side rendering
- SEO optimization, fast page loads
- App Router, Server Components

### React 18.2.0
- Component-based UI library
- Hooks, Context API, Suspense

### TypeScript 5.3.3
- Type safety, better IDE support
- Interfaces, Generics, Type inference

### TailwindCSS 3.4.0
- Utility-first CSS framework
- Responsive design, JIT compiler

### Zustand 4.4.7
- Lightweight state management
- Simple API, TypeScript support

### Framer Motion 10.16.16
- Animation library
- Page transitions, gestures

### Axios 1.6.2
- HTTP client with interceptors
- JWT token injection

### Web Speech API
- Speech Recognition (voice input)
- Speech Synthesis (voice output)
- Browser native, no dependencies

## Backend Technologies

### Spring Boot 3.2.0
- Java web framework
- Spring Web, Data JPA, Security

### Java 17 (LTS)
- Type-safe, enterprise-grade
- Records, Sealed classes, Streams

### PostgreSQL 14+
- Relational database
- ACID compliance, JSON support

### Spring Security 6.2.0
- JWT authentication
- Password encryption (BCrypt)

### Hibernate 6.4.0
- ORM framework
- Entity mapping, lazy loading

## ML Service Technologies

### FastAPI 0.111.0
- Modern Python web framework
- Async support, auto API docs

### Google Gemini AI (gemini-pro)
- Interview evaluation
- Question generation
- Temperature: 0.7, Max tokens: 2048

### PaddleOCR 2.7.3 (Primary)
- 95% accuracy OCR
- Certificate text extraction
- 80+ languages

### Tesseract OCR 0.3.10 (Fallback)
- 85% accuracy
- Backup OCR engine

### PyMuPDF 1.24.1
- PDF to image conversion
- Text extraction

### OpenCV 4.9.0.80
- Image preprocessing
- QR code detection

### Pillow 10.3.0
- Image manipulation
- Format conversion

## AI & ML Models

### 1. Gemini AI (gemini-pro)
**Purpose**: Interview evaluation
- Context: 32,768 tokens
- Output: 2,048 tokens
- Latency: 2-3 seconds
- Free tier: 60 req/min

### 2. PaddleOCR (PP-OCRv3)
**Purpose**: Certificate OCR
- Accuracy: 95%
- Speed: 0.5-1 sec/page
- Architecture: DB + CRNN + ResNet

### 3. Tesseract OCR v5
**Purpose**: Fallback OCR
- Accuracy: 85%
- Speed: 1-2 sec/page

## Version Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | Next.js | 14.0.4 |
| UI | React | 18.2.0 |
| Language | TypeScript | 5.3.3 |
| Styling | TailwindCSS | 3.4.0 |
| Backend | Spring Boot | 3.2.0 |
| Language | Java | 17 |
| Database | PostgreSQL | 14+ |
| ML | FastAPI | 0.111.0 |
| Language | Python | 3.10+ |
| AI | Gemini Pro | Latest |
| OCR | PaddleOCR | 2.7.3 |

**Last Updated**: May 7, 2026

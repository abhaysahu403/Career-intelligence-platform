# 🚀 AI-Generated Roadmap System

## Overview

The **AI-Generated Roadmap System** is a personalized learning path generator that analyzes a user's interview performance and creates a customized study plan to improve weak areas. Unlike static roadmaps, this system dynamically adapts based on real interview data.

---

## 🎯 Key Features

### 1. **Dynamic Weak Skill Detection**
- Analyzes all interview attempts
- Identifies topics where user scored < 70%
- Tracks repeated weak areas across multiple interviews
- Prioritizes skills that appear most frequently

### 2. **AI-Powered Study Plans**
- Generates personalized weekly learning tasks
- Prioritizes HIGH/MEDIUM/LOW based on frequency and impact
- Includes specific action items:
  - 📖 Study core concepts
  - 💻 Practice problems
  - 🎤 Mock interviews
  - 📚 Recommended resources

### 3. **PDF Report Generation**
- Professional HTML-based reports (can be printed to PDF)
- Includes:
  - Weak skills analysis
  - Week-by-week study plan
  - Priority levels for each topic
  - Recommended learning resources
  - Progress tracking

### 4. **Real-Time Progress Tracking**
- Tracks completion of roadmap tasks
- Shows percentage completion
- Updates dynamically as user completes interviews
- Provides visual progress indicators

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER TAKES INTERVIEW                      │
│              (Gemini AI evaluates answers)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ANALYTICS SERVICE (Backend)                     │
│  • Extracts weak skills (score < 70%)                       │
│  • Counts frequency of each weak topic                      │
│  • Ranks by priority (HIGH/MEDIUM/LOW)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ROADMAP GENERATION (Frontend)                   │
│  • Fetches analytics data                                   │
│  • Displays dynamic study plan                              │
│  • Shows week-by-week tasks                                 │
│  • Provides download as PDF                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 How It Works

### Step 1: Interview Analysis
```java
// Backend: AnalyticsService.java
private List<String> extractWeakSkills(List<InterviewResponse> history) {
    Map<String, Integer> counts = new LinkedHashMap<>();
    
    for (InterviewResponse interview : history) {
        for (Answer answer : interview.getAnswers()) {
            double score = answer.getScore();
            String topic = answer.getTopic();
            
            // Track topics with score < 70%
            if (score > 0 && score < 70) {
                counts.put(topic, counts.getOrDefault(topic, 0) + 1);
            }
        }
    }
    
    // Return top 5 most frequent weak skills
    return counts.entrySet().stream()
        .filter(entry -> entry.getValue() >= 1)
        .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
        .map(Map.Entry::getKey)
        .limit(5)
        .toList();
}
```

### Step 2: Priority Assignment
```typescript
// Frontend: roadmap/page.tsx
const priority = idx === 0 ? 'HIGH' : idx === 1 ? 'MEDIUM' : 'LOW';
```

- **HIGH**: Most frequent weak skill (appears most in interviews)
- **MEDIUM**: Second most frequent
- **LOW**: Third most frequent

### Step 3: Task Generation
For each weak skill, the system generates:

1. **Study Core Concepts**
   - Review fundamentals
   - Understand definitions and patterns
   - Learn common use cases

2. **Practice Problems**
   - Solve 5-10 problems on LeetCode/HackerRank
   - Focus on the specific weak topic
   - Practice edge cases

3. **Mock Interview**
   - Take AI interview focused on that topic
   - Validate understanding
   - Get real-time feedback

### Step 4: Resource Recommendations
```typescript
const weaknessPlan: Record<string, { tasks: string[]; resources: Resource[] }> = {
  'time complexity': {
    tasks: [
      'Review Big-O notation fundamentals',
      'Analyze complexity of 10 common algorithms',
      'Practice explaining complexity in mock interviews'
    ],
    resources: [
      { title: 'Big-O Cheat Sheet', url: 'https://www.bigocheatsheet.com/' }
    ]
  },
  'system design': {
    tasks: [
      'Study URL shortener design pattern',
      'Practice drawing system diagrams',
      'Take an AI interview focused on System Design'
    ],
    resources: [
      { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' }
    ]
  }
  // ... more topics
};
```

---

## 🎨 User Interface

### Progress Overview Card
```
┌─────────────────────────────────────────────────────────┐
│  🏆 AI-Generated Roadmap                                │
│  Personalized learning path based on interview data     │
│                                                          │
│  Progress: ████████░░░░░░░░░░ 45%                      │
│  Completed: 9/20 tasks                                  │
│                                                          │
│  [Download PDF Report]                                  │
└─────────────────────────────────────────────────────────┘
```

### Dynamic Gap Study Plan
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Dynamic Gap Study Plan                              │
│                                                          │
│  🔴 HIGH PRIORITY: system design                        │
│  • Study URL shortener design pattern                   │
│  • Practice drawing system diagrams                     │
│  • Take AI interview on System Design                   │
│  📚 System Design Primer                                │
│                                                          │
│  🟡 MEDIUM PRIORITY: edge cases                         │
│  • Always check null/empty inputs first                 │
│  • Practice boundary value analysis                     │
│  • Solve 5 problems focusing on edge cases              │
│  📚 LeetCode Edge Cases                                 │
└─────────────────────────────────────────────────────────┘
```

### Week-by-Week Timeline
```
┌─────────────────────────────────────────────────────────┐
│  Week 1  ████████████░░░░░░░░ 60%                      │
│  ✓ Study Core Concepts                                  │
│  ✓ Practice Problems                                    │
│  ○ Mock Interview                                       │
│                                                          │
│  Week 2  ░░░░░░░░░░░░░░░░░░░░ 0%                       │
│  ○ Study Core Concepts                                  │
│  ○ Practice Problems                                    │
│  ○ Mock Interview                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📥 PDF Report Generation

### Backend Implementation
```java
// PdfGenerationService.java
public byte[] generateRoadmapReport(
    Map<String, Object> analytics,
    List<Map<String, Object>> tasks,
    String userName
) {
    StringBuilder html = new StringBuilder();
    
    // Header with user name and date
    html.append("<div class='header'>");
    html.append("<h1>🚀 AI-Generated Career Roadmap</h1>");
    html.append("<p>Personalized for: <strong>").append(userName).append("</strong></p>");
    html.append("</div>");
    
    // Weak skills section
    html.append("<h2>🎯 Focus Areas</h2>");
    for (String skill : weakSkills) {
        html.append("<span class='skill-tag'>").append(skill).append("</span>");
    }
    
    // Week-by-week study plan
    for (String skill : weakSkills) {
        html.append("<div class='week-section'>");
        html.append("<h3>Week ").append(weekNum).append(": Master ").append(skill).append("</h3>");
        
        // Tasks for this week
        html.append("<div class='task'>📖 Study Core Concepts</div>");
        html.append("<div class='task'>💻 Practice Problems</div>");
        html.append("<div class='task'>🎤 Mock Interview</div>");
        
        html.append("</div>");
    }
    
    return convertHtmlToPdf(html.toString());
}
```

### Frontend Download
```typescript
const response = await roadmapApi.downloadRoadmap({ tasks: allTasks });

const blob = new Blob([response.data], { type: 'text/html' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `ai-roadmap-${new Date().toISOString().split('T')[0]}.html`;
link.click();
```

---

## 🔄 Real-Time Updates

The roadmap updates automatically when:

1. **User completes a new interview**
   - Weak skills are recalculated
   - Priority levels are adjusted
   - New tasks are generated

2. **User marks tasks as complete**
   - Progress percentage updates
   - Completion status changes
   - Visual indicators update

3. **User improves in a weak area**
   - That skill is removed from weak list
   - New weak skills are added
   - Roadmap regenerates

---

## 🎯 Impact on Career Readiness

### Before AI Roadmap
- ❌ Generic study plans
- ❌ No personalization
- ❌ Static content
- ❌ No progress tracking

### After AI Roadmap
- ✅ Personalized based on real data
- ✅ Dynamic updates
- ✅ Prioritized by impact
- ✅ Real-time progress tracking
- ✅ Downloadable PDF reports

---

## 📈 Success Metrics

### For Users
- **Targeted Learning**: Focus only on weak areas
- **Time Efficiency**: No wasted time on strong topics
- **Measurable Progress**: Track improvement week by week
- **Career Boost**: Improve readiness score by 15-25 points

### For Platform
- **Engagement**: Users return to complete roadmap tasks
- **Retention**: Personalized content keeps users active
- **Success Rate**: Higher interview scores after following roadmap
- **Differentiation**: Unique AI-powered feature

---

## 🚀 Future Enhancements

1. **ML-Powered Predictions**
   - Predict time to readiness
   - Suggest optimal study schedule
   - Recommend best interview timing

2. **Integration with Job Matching**
   - Show which jobs become accessible after completing roadmap
   - Estimate salary increase potential
   - Track career progression

3. **Gamification**
   - Badges for completing weeks
   - Leaderboards for fastest improvement
   - Streak tracking

4. **Social Features**
   - Share roadmap with peers
   - Study groups for same weak skills
   - Mentor matching

---

## 🛠️ Technical Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend** | Spring Boot | Analytics & PDF generation |
| **Frontend** | Next.js + React | Dynamic UI & visualization |
| **AI Engine** | Google Gemini AI | Interview evaluation |
| **Data Analysis** | Java Streams | Weak skill extraction |
| **PDF Generation** | HTML + CSS | Professional reports |
| **State Management** | React Query | Real-time updates |

---

## 📝 API Endpoints

### Get Analytics (with weak skills)
```http
GET /analytics
Headers: X-User-Id: {userId}

Response:
{
  "readiness": 68,
  "weakSkills": ["system design", "edge cases", "time complexity"],
  "latestRecommendation": "Focus on system design patterns",
  "totalAttempts": 5
}
```

### Download Progress Report
```http
GET /analytics/download/progress
Headers: X-User-Id: {userId}

Response: HTML file (can be printed to PDF)
```

### Download Roadmap Report
```http
POST /analytics/download/roadmap
Headers: X-User-Id: {userId}
Body: { "tasks": [...] }

Response: HTML file (can be printed to PDF)
```

---

## 🎓 Example User Journey

### Day 1: First Interview
- User takes AI interview
- Scores: DSA (45%), System Design (55%), OOP (75%)
- **Weak Skills Detected**: DSA, System Design

### Day 2: Roadmap Generated
- **Week 1 (HIGH)**: Master DSA
  - Study arrays, linked lists, trees
  - Solve 10 LeetCode problems
  - Take mock interview on DSA
- **Week 2 (MEDIUM)**: Master System Design
  - Study URL shortener pattern
  - Practice drawing diagrams
  - Take mock interview on System Design

### Week 1: Following Roadmap
- Completes DSA study tasks
- Solves 10 problems
- Takes mock interview → Score: 72% ✅

### Week 2: Improvement Visible
- DSA removed from weak skills
- New weak skill detected: Database
- Roadmap updates automatically

### Week 4: Ready to Apply
- All weak skills improved
- Readiness score: 68 → 85
- Downloads final roadmap PDF
- Starts applying to jobs

---

## 🏆 Competitive Advantage

### vs. Generic Platforms (LeetCode, HackerRank)
- ✅ **Personalized**: Based on YOUR weak areas
- ✅ **Integrated**: Connected to interview performance
- ✅ **Actionable**: Specific tasks, not just problems
- ✅ **Trackable**: Progress visualization

### vs. Static Roadmaps (roadmap.sh)
- ✅ **Dynamic**: Updates based on real data
- ✅ **AI-Powered**: Uses Gemini AI for analysis
- ✅ **Career-Focused**: Tied to job readiness
- ✅ **Downloadable**: Professional PDF reports

---

## 📚 Resources

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Big-O Cheat Sheet](https://www.bigocheatsheet.com/)
- [LeetCode Patterns](https://seanprashad.com/leetcode-patterns/)
- [NeetCode 150](https://neetcode.io/practice)
- [STAR Method Guide](https://www.themuse.com/advice/star-interview-method)

---

## 🎯 Conclusion

The **AI-Generated Roadmap System** transforms generic study plans into personalized, data-driven learning paths. By analyzing real interview performance and dynamically adapting to user progress, it provides the most efficient path to career readiness.

**Key Takeaway**: Instead of guessing what to study, users get a precise, AI-powered roadmap based on their actual weak areas, saving time and maximizing improvement.

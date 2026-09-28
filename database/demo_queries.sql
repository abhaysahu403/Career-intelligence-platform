-- ============================================
-- CIP Platform - REAL DATABASE DEMO FOR JUDGES
-- Database: cip_db (PostgreSQL)
-- ============================================

-- HOW TO CONNECT:
-- psql -U postgres -d cip_db
-- Password: cip123 (if prompted)

-- ============================================
-- 1. SHOW ALL TABLES IN THE SYSTEM
-- ============================================
\dt

-- ============================================
-- 2. SYSTEM OVERVIEW - TOTAL RECORD COUNTS
-- ============================================
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM interviews) as total_interviews,
  (SELECT COUNT(*) FROM facial_analytics) as facial_analytics_records,
  (SELECT COUNT(*) FROM certificates) as total_certificates,
  (SELECT COUNT(*) FROM certificate_results) as certificate_validations,
  (SELECT COUNT(*) FROM resumes) as total_resumes,
  (SELECT COUNT(*) FROM jobs) as total_jobs,
  (SELECT COUNT(*) FROM scores) as total_scores,
  (SELECT COUNT(*) FROM student_profiles) as student_profiles,
  (SELECT COUNT(*) FROM custom_interviews) as custom_interviews,
  (SELECT COUNT(*) FROM gd_sessions) as gd_sessions;

-- ============================================
-- 3. USERS TABLE - Show Recent Users
-- ============================================
SELECT 
  id, 
  name, 
  email, 
  role, 
  active,
  created_at,
  updated_at
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- 4. INTERVIEWS TABLE - Recent Interviews with Full Details
-- ============================================
SELECT 
  i.id,
  u.name as student_name,
  u.email,
  i.interview_mode,
  i.round_type,
  i.company,
  i.job_role,
  i.difficulty,
  i.persona,
  i.status,
  i.total_score,
  i.total_questions,
  i.answered_questions,
  i.started_at,
  i.completed_at
FROM interviews i
JOIN users u ON i.user_id = u.id
ORDER BY i.started_at DESC 
LIMIT 10;

-- ============================================
-- 5. FACIAL ANALYTICS - Real-time Interview Monitoring
-- ============================================
SELECT 
  id,
  interview_id,
  confidence_score,
  eye_contact,
  emotion,
  posture,
  stress_level,
  voice_clarity,
  filler_words_count,
  speaking_pace,
  timestamp
FROM facial_analytics 
ORDER BY timestamp DESC 
LIMIT 20;

-- ============================================
-- 6. CERTIFICATES - Uploaded Certificates
-- ============================================
SELECT 
  c.id,
  u.name as student_name,
  c.file_name,
  c.file_type,
  c.file_size,
  c.status,
  c.created_at
FROM certificates c
JOIN users u ON c.user_id = u.id
ORDER BY c.created_at DESC 
LIMIT 10;

-- ============================================
-- 7. CERTIFICATE RESULTS - AI Validation Results
-- ============================================
SELECT 
  cr.id,
  cr.certificate_id,
  cr.authenticity_score,
  cr.status,
  cr.confidence_level,
  cr.processing_time_ms,
  cr.created_at
FROM certificate_results cr
ORDER BY cr.created_at DESC 
LIMIT 10;

-- ============================================
-- 8. RESUMES - Uploaded and Parsed Resumes
-- ============================================
SELECT 
  r.id,
  u.name as student_name,
  r.file_name,
  r.parse_status,
  r.resume_score,
  r.file_size_bytes,
  r.uploaded_at
FROM resumes r
JOIN users u ON r.user_id = u.id
ORDER BY r.uploaded_at DESC 
LIMIT 10;

-- ============================================
-- 9. JOBS - Available Job Listings
-- ============================================
SELECT 
  id,
  company,
  role,
  location,
  employment_type,
  experience_level,
  salary_range,
  minimum_readiness_score,
  active,
  application_deadline,
  created_at
FROM jobs 
WHERE active = true
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- 10. SCORES - Student Career Readiness Scores
-- ============================================
SELECT 
  s.user_id,
  u.name as student_name,
  s.resume_score,
  s.academic_score,
  s.interview_score,
  s.readiness,
  s.level,
  s.recommendation,
  s.calculated_at
FROM scores s
JOIN users u ON s.user_id = u.id
ORDER BY s.readiness DESC 
LIMIT 10;

-- ============================================
-- 11. STUDENT PROFILES - Detailed Student Information
-- ============================================
SELECT 
  sp.user_id,
  sp.name,
  sp.email,
  sp.institution,
  sp.department,
  sp.graduation_year,
  sp.linkedin_url,
  sp.github_url,
  sp.created_at
FROM student_profiles sp
ORDER BY sp.created_at DESC 
LIMIT 10;

-- ============================================
-- 12. CUSTOM INTERVIEWS - Faculty Created Interviews
-- ============================================
SELECT 
  ci.id,
  u.name as created_by,
  ci.title,
  ci.interview_code,
  ci.duration_minutes,
  ci.difficulty,
  ci.status,
  ci.total_questions,
  ci.created_at,
  ci.expires_at
FROM custom_interviews ci
JOIN users u ON ci.created_by_user_id = u.id
ORDER BY ci.created_at DESC 
LIMIT 10;

-- ============================================
-- 13. CUSTOM INTERVIEW ATTEMPTS - Student Attempts
-- ============================================
SELECT 
  cia.id,
  ci.title as interview_title,
  cia.student_name,
  cia.student_email,
  cia.status,
  cia.total_score,
  cia.started_at,
  cia.completed_at
FROM custom_interview_attempts cia
JOIN custom_interviews ci ON cia.custom_interview_id = ci.id
ORDER BY cia.started_at DESC 
LIMIT 10;

-- ============================================
-- 14. GD SESSIONS - Group Discussion Sessions
-- ============================================
SELECT 
  gs.id,
  u.name as student_name,
  gs.topic_text,
  gs.duration,
  gs.status,
  gs.speaking_time_seconds,
  gs.interruption_count,
  gs.points_made,
  gs.overall_score,
  gs.leadership_score,
  gs.communication_score,
  gs.started_at,
  gs.completed_at
FROM gd_sessions gs
JOIN users u ON gs.user_id = u.id
ORDER BY gs.started_at DESC 
LIMIT 10;

-- ============================================
-- 15. COMPANY QUESTIONS - Company-Specific Interview Questions
-- ============================================
SELECT 
  id,
  company_name,
  role,
  difficulty,
  category,
  LEFT(question, 100) as question_preview,
  created_at
FROM company_questions
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- 16. BRANCH QUESTIONS - Branch-Specific Technical Questions
-- ============================================
SELECT 
  id,
  branch,
  subject,
  difficulty,
  LEFT(question, 100) as question_preview,
  created_at
FROM branch_questions
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- 17. COMPLETE INTERVIEW SESSION ANALYSIS
-- (Replace interview_id = 1 with actual ID)
-- ============================================
SELECT 
  i.id as interview_id,
  u.name as student_name,
  i.interview_mode,
  i.round_type,
  i.company,
  i.job_role,
  i.status,
  i.total_score,
  i.total_questions,
  i.answered_questions,
  COUNT(fa.id) as facial_analytics_count,
  AVG(fa.confidence_score) as avg_confidence,
  AVG(fa.stress_level) as avg_stress,
  AVG(fa.voice_clarity) as avg_voice_clarity,
  SUM(fa.filler_words_count) as total_filler_words
FROM interviews i
JOIN users u ON i.user_id = u.id
LEFT JOIN facial_analytics fa ON fa.interview_id = i.id
WHERE i.id = 1
GROUP BY i.id, u.name, i.interview_mode, i.round_type, i.company, 
         i.job_role, i.status, i.total_score, i.total_questions, i.answered_questions;

-- ============================================
-- 18. FACIAL ANALYTICS TIMELINE FOR AN INTERVIEW
-- Shows how confidence/stress changed over time
-- ============================================
SELECT 
  interview_id,
  timestamp,
  confidence_score,
  eye_contact,
  emotion,
  posture,
  stress_level,
  voice_clarity,
  filler_words_count
FROM facial_analytics 
WHERE interview_id = 1
ORDER BY timestamp ASC;

-- ============================================
-- 19. TOP PERFORMING STUDENTS
-- ============================================
SELECT 
  u.name,
  u.email,
  COUNT(i.id) as total_interviews,
  AVG(i.total_score) as average_score,
  MAX(i.total_score) as best_score,
  s.readiness as career_readiness
FROM users u
JOIN interviews i ON i.user_id = u.id
LEFT JOIN scores s ON s.user_id = u.id
WHERE i.status = 'COMPLETED'
GROUP BY u.id, u.name, u.email, s.readiness
ORDER BY average_score DESC 
LIMIT 10;

-- ============================================
-- 20. CERTIFICATE VALIDATION DETAILS
-- Shows full validation pipeline results
-- ============================================
SELECT 
  c.id as certificate_id,
  u.name as student_name,
  c.file_name,
  cr.authenticity_score,
  cr.status,
  cr.confidence_level,
  cr.extracted_data->>'issuer' as detected_issuer,
  cr.extracted_data->>'certificateName' as detected_name,
  cr.processing_time_ms,
  c.created_at
FROM certificates c
JOIN users u ON c.user_id = u.id
LEFT JOIN certificate_results cr ON cr.certificate_id = c.id
ORDER BY c.created_at DESC 
LIMIT 10;

-- ============================================
-- 21. INTERVIEW QUESTIONS AND ANSWERS (JSON DATA)
-- Shows questions asked in interviews
-- ============================================
SELECT 
  i.id as interview_id,
  u.name as student_name,
  i.interview_mode,
  i.round_type,
  jsonb_array_length(i.questions::jsonb) as total_questions,
  jsonb_array_length(i.answers::jsonb) as total_answers,
  i.total_score,
  i.started_at
FROM interviews i
JOIN users u ON i.user_id = u.id
WHERE i.questions IS NOT NULL
ORDER BY i.started_at DESC 
LIMIT 10;

-- ============================================
-- 22. SYSTEM HEALTH CHECK - Data Integrity
-- ============================================
SELECT 
  'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Interviews', COUNT(*) FROM interviews
UNION ALL
SELECT 'Facial Analytics', COUNT(*) FROM facial_analytics
UNION ALL
SELECT 'Certificates', COUNT(*) FROM certificates
UNION ALL
SELECT 'Certificate Results', COUNT(*) FROM certificate_results
UNION ALL
SELECT 'Resumes', COUNT(*) FROM resumes
UNION ALL
SELECT 'Jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'Scores', COUNT(*) FROM scores
UNION ALL
SELECT 'Student Profiles', COUNT(*) FROM student_profiles
UNION ALL
SELECT 'Custom Interviews', COUNT(*) FROM custom_interviews
UNION ALL
SELECT 'GD Sessions', COUNT(*) FROM gd_sessions
UNION ALL
SELECT 'Company Questions', COUNT(*) FROM company_questions
UNION ALL
SELECT 'Branch Questions', COUNT(*) FROM branch_questions
ORDER BY record_count DESC;

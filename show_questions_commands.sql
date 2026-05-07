-- ============================================
-- SHOW ALL QUESTIONS IN DATABASE
-- ============================================

-- 1. COMPANY-SPECIFIC QUESTIONS (company_questions table)
-- These are pre-loaded questions for specific companies
SELECT 
  id,
  company_name,
  role,
  category,
  difficulty,
  question,
  LEFT(ideal_answer, 100) as ideal_answer_preview,
  tags,
  created_at
FROM company_questions
ORDER BY company_name, difficulty
LIMIT 20;

-- Count by company
SELECT 
  company_name,
  COUNT(*) as total_questions,
  COUNT(CASE WHEN difficulty = 'EASY' THEN 1 END) as easy,
  COUNT(CASE WHEN difficulty = 'MEDIUM' THEN 1 END) as medium,
  COUNT(CASE WHEN difficulty = 'HARD' THEN 1 END) as hard
FROM company_questions
GROUP BY company_name
ORDER BY total_questions DESC;

-- ============================================
-- 2. BRANCH-SPECIFIC QUESTIONS (branch_questions table)
-- These are technical questions for different branches (CSE, Mechanical, etc.)
SELECT 
  id,
  branch,
  subject,
  difficulty,
  question,
  LEFT(ideal_answer, 100) as ideal_answer_preview,
  tags,
  created_at
FROM branch_questions
ORDER BY branch, difficulty
LIMIT 20;

-- Count by branch
SELECT 
  branch,
  COUNT(*) as total_questions,
  COUNT(CASE WHEN difficulty = 'EASY' THEN 1 END) as easy,
  COUNT(CASE WHEN difficulty = 'MEDIUM' THEN 1 END) as medium,
  COUNT(CASE WHEN difficulty = 'HARD' THEN 1 END) as hard
FROM branch_questions
GROUP BY branch
ORDER BY total_questions DESC;

-- ============================================
-- 3. CUSTOM INTERVIEW QUESTIONS (custom_interview_questions table)
-- These are questions created by faculty for custom interviews
SELECT 
  ciq.id,
  ci.title as interview_title,
  ci.interview_code,
  ciq.question_text,
  ciq.question_type,
  ciq.difficulty,
  ciq.points,
  LEFT(ciq.ideal_answer, 100) as ideal_answer_preview,
  ciq.created_at
FROM custom_interview_questions ciq
JOIN custom_interviews ci ON ciq.custom_interview_id = ci.id
ORDER BY ci.created_at DESC, ciq.id
LIMIT 20;

-- Count custom questions by interview
SELECT 
  ci.title,
  ci.interview_code,
  ci.difficulty,
  COUNT(ciq.id) as total_questions,
  ci.created_at
FROM custom_interviews ci
LEFT JOIN custom_interview_questions ciq ON ciq.custom_interview_id = ci.id
GROUP BY ci.id, ci.title, ci.interview_code, ci.difficulty, ci.created_at
ORDER BY ci.created_at DESC;

-- ============================================
-- 4. INTERVIEW QUESTIONS (from interviews table - JSON format)
-- These are questions asked during actual interview sessions
SELECT 
  i.id as interview_id,
  u.name as student_name,
  i.interview_mode,
  i.round_type,
  i.company,
  i.job_role,
  jsonb_array_length(i.questions::jsonb) as total_questions,
  i.questions::jsonb as all_questions,
  i.started_at
FROM interviews i
JOIN users u ON i.user_id = u.id
WHERE i.questions IS NOT NULL
ORDER BY i.started_at DESC
LIMIT 5;

-- Extract individual questions from interviews (pretty format)
SELECT 
  i.id as interview_id,
  u.name as student_name,
  i.interview_mode,
  i.round_type,
  q.value->>'question' as question_text,
  q.value->>'difficulty' as difficulty,
  q.value->>'topic' as topic,
  q.value->>'expectedAnswer' as expected_answer
FROM interviews i
JOIN users u ON i.user_id = u.id,
jsonb_array_elements(i.questions::jsonb) WITH ORDINALITY AS q(value, position)
WHERE i.questions IS NOT NULL
ORDER BY i.started_at DESC, q.position
LIMIT 20;

-- ============================================
-- 5. GD TOPICS (gd_topics table)
-- Group Discussion topics
SELECT 
  id,
  topic,
  category,
  difficulty,
  description,
  key_points,
  created_at
FROM gd_topics
ORDER BY category, difficulty
LIMIT 20;

-- Count by category
SELECT 
  category,
  COUNT(*) as total_topics,
  COUNT(CASE WHEN difficulty = 'EASY' THEN 1 END) as easy,
  COUNT(CASE WHEN difficulty = 'MEDIUM' THEN 1 END) as medium,
  COUNT(CASE WHEN difficulty = 'HARD' THEN 1 END) as hard
FROM gd_topics
GROUP BY category
ORDER BY total_topics DESC;

-- ============================================
-- 6. INTERVIEW TEMPLATES (interview_templates table)
-- Pre-defined interview templates
SELECT 
  id,
  template_name,
  description,
  interview_type,
  difficulty,
  duration_minutes,
  created_at
FROM interview_templates
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- 7. COMPLETE QUESTION SUMMARY
-- Total count of all question types
SELECT 
  'Company Questions' as question_type,
  COUNT(*) as total
FROM company_questions
UNION ALL
SELECT 
  'Branch Questions',
  COUNT(*)
FROM branch_questions
UNION ALL
SELECT 
  'Custom Interview Questions',
  COUNT(*)
FROM custom_interview_questions
UNION ALL
SELECT 
  'GD Topics',
  COUNT(*)
FROM gd_topics
UNION ALL
SELECT 
  'Interview Templates',
  COUNT(*)
FROM interview_templates
UNION ALL
SELECT 
  'Interviews with Questions',
  COUNT(*)
FROM interviews
WHERE questions IS NOT NULL;

-- ============================================
-- 8. SHOW SPECIFIC COMPANY QUESTIONS (Example: Google)
SELECT 
  id,
  company_name,
  role,
  category,
  difficulty,
  question,
  ideal_answer,
  tags
FROM company_questions
WHERE company_name ILIKE '%google%'
ORDER BY difficulty;

-- ============================================
-- 9. SHOW SPECIFIC BRANCH QUESTIONS (Example: CSE)
SELECT 
  id,
  branch,
  subject,
  difficulty,
  question,
  ideal_answer,
  tags
FROM branch_questions
WHERE branch ILIKE '%cse%' OR branch ILIKE '%computer%'
ORDER BY difficulty;

-- ============================================
-- 10. SHOW QUESTIONS WITH ANSWERS FROM COMPLETED INTERVIEWS
SELECT 
  i.id as interview_id,
  u.name as student_name,
  i.interview_mode,
  i.total_score,
  q.value->>'question' as question,
  a.value->>'answer' as student_answer,
  a.value->>'score' as score,
  i.started_at
FROM interviews i
JOIN users u ON i.user_id = u.id,
jsonb_array_elements(i.questions::jsonb) WITH ORDINALITY AS q(value, q_pos),
jsonb_array_elements(i.answers::jsonb) WITH ORDINALITY AS a(value, a_pos)
WHERE i.questions IS NOT NULL 
  AND i.answers IS NOT NULL
  AND q.q_pos = a.a_pos
ORDER BY i.started_at DESC
LIMIT 10;

-- ============================================
-- 11. SEARCH QUESTIONS BY KEYWORD
-- Replace 'algorithm' with any keyword you want to search
SELECT 
  'Company Question' as source,
  company_name as context,
  question,
  difficulty
FROM company_questions
WHERE question ILIKE '%algorithm%'
UNION ALL
SELECT 
  'Branch Question',
  branch,
  question,
  difficulty
FROM branch_questions
WHERE question ILIKE '%algorithm%'
LIMIT 20;

-- ============================================
-- 12. MOST RECENT QUESTIONS ASKED IN INTERVIEWS
SELECT 
  i.id,
  u.name,
  i.interview_mode,
  i.round_type,
  i.company,
  q.value->>'question' as question,
  q.value->>'difficulty' as difficulty,
  q.value->>'topic' as topic,
  i.started_at
FROM interviews i
JOIN users u ON i.user_id = u.id,
jsonb_array_elements(i.questions::jsonb) AS q(value)
WHERE i.questions IS NOT NULL
ORDER BY i.started_at DESC
LIMIT 15;

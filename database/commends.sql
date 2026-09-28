Option 2: Command Line (psql) - Quick & Professional 🚀
Open Command Prompt and connect to PostgreSQL:

# Connect to your database
psql -U postgres -d your_database_name

# Or if you have a specific user
psql -U your_username -d cip_database
Essential Commands to Show Judges:
-- 1. List all tables
\dt

-- 2. Show table structure
\d facial_analytics
\d users
\d interviews
\d certificates

-- 3. Show recent data from key tables

-- Facial Analytics (real-time interview data)
SELECT id, interview_id, confidence_score, eye_contact, emotion, 
       posture, stress_level, timestamp 
FROM facial_analytics 
ORDER BY timestamp DESC 
LIMIT 10;

-- Users
SELECT id, email, full_name, role, created_at 
FROM users 
LIMIT 10;

-- Interviews
SELECT id, user_id, interview_mode, round_type, status, 
       overall_score, created_at 
FROM interviews 
ORDER BY created_at DESC 
LIMIT 10;

-- Certificates
SELECT id, user_id, certificate_name, issuer, 
       authenticity_score, status, uploaded_at 
FROM certificates 
ORDER BY uploaded_at DESC 
LIMIT 10;

-- Interview Questions
SELECT id, interview_id, question_text, difficulty, 
       topic, answer_text, score 
FROM interview_questions 
LIMIT 5;

-- Count records (show data volume)
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM interviews) as total_interviews,
  (SELECT COUNT(*) FROM facial_analytics) as total_analytics,
  (SELECT COUNT(*) FROM certificates) as total_certificates;
Option 3: Create a Demo Script 📋
Create a file demo_queries.sql with all the queries you want to show:




Perfect! I've created the complete SQL demo script. Here's what you need to do:

🎯 HOW TO SHOW DATABASE TO JUDGES
Option 1: Command Line (Professional & Fast) ⚡
Open Command Prompt (Windows Key + R, type cmd)

Connect to PostgreSQL:

psql -U postgres -d cip_db
Password: cip123 (if prompted)

Run the demo queries from the file I created:
\i demo_queries.sql
OR run individual commands from the file.

Option 2: pgAdmin (Visual & Easy for Judges) 👁️
Open pgAdmin
Connect to your server
Navigate to: Servers → PostgreSQL → Databases → cip_db
Click Query Tool (lightning bolt icon)
Copy-paste queries from demo_queries.sql
Click Execute (F5)
📊 KEY TABLES TO SHOW JUDGES:
Real Database Name: cip_db
Real Username: postgres
Real Password: cip123
Main Tables:
users - All registered users (students, faculty, admin)
interviews - Interview sessions with scores
facial_analytics - Real-time facial tracking during interviews
certificates - Uploaded certificates
certificate_results - AI validation results
resumes - Parsed resumes with ML scores
jobs - Job listings
scores - Career readiness scores
student_profiles - Detailed student information
custom_interviews - Faculty-created interviews
gd_sessions - Group discussion sessions
company_questions - Company-specific questions
branch_questions - Branch-specific questions
🚀 QUICK DEMO COMMANDS:
-- Show all tables
\dt

-- Show total records
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM interviews) as interviews,
  (SELECT COUNT(*) FROM facial_analytics) as facial_data,
  (SELECT COUNT(*) FROM certificates) as certificates;

-- Show recent interviews
SELECT id, user_id, interview_mode, round_type, total_score, started_at 
FROM interviews 
ORDER BY started_at DESC 
LIMIT 5;

-- Show facial analytics (real-time data)
SELECT interview_id, confidence_score, eye_contact, emotion, stress_level, timestamp 
FROM facial_analytics 
ORDER BY timestamp DESC 
LIMIT 10;
💡 TIPS FOR DEMO:
Start with \dt to show all tables
Show record counts to prove data exists
Show facial_analytics - this is impressive (real-time monitoring)
Show certificate_results - AI validation scores
Show interviews with users - complete interview sessions
Show gd_sessions - group discussion feature
The file demo_queries.sql contains 22 ready-to-run queries covering all aspects of your system!

Est. Credits Used: 1.88
Elapsed time: 3m 18s


Checkpoint
Restore
Microsoft Windows [Version 10.0.26200.8039]

(c) Microsoft Corporation. All rights reserved.

C:\Users\HP>psql -U postgres -d cip_db

'psql' is not recognized as an internal or external command,

operable program or batch file.

C:\Users\HP>



Kiro
No problem! psql is not in your PATH. Let's use pgAdmin instead, which you mentioned you have installed. Here's how:

🎯 SOLUTION: Use pgAdmin (Easier for Demo)
Step 1: Open pgAdmin
Search for "pgAdmin" in Windows Start Menu
Open pgAdmin 4
Step 2: Connect to Database
In the left sidebar, expand: Servers
Click on PostgreSQL (it may ask for password)
Expand Databases
Find and click on cip_db
Step 3: Open Query Tool
Right-click on cip_db
Select Query Tool (or press F5)
Step 4: Run Demo Queries
Now you can copy-paste queries from the demo_queries.sql file I created!

🚀 QUICK START QUERIES FOR JUDGES:
Copy these one by one into pgAdmin Query Tool and click Execute (▶️ button):

1. Show All Tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
2. System Overview - Record Counts
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM interviews) as total_interviews,
  (SELECT COUNT(*) FROM facial_analytics) as facial_analytics_records,
  (SELECT COUNT(*) FROM certificates) as total_certificates,
  (SELECT COUNT(*) FROM resumes) as total_resumes,
  (SELECT COUNT(*) FROM jobs) as total_jobs;
3. Recent Users
SELECT id, name, email, role, active, created_at
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
4. Recent Interviews with Scores
SELECT 
  i.id,
  u.name as student_name,
  i.interview_mode,
  i.round_type,
  i.company,
  i.status,
  i.total_score,
  i.started_at
FROM interviews i
JOIN users u ON i.user_id = u.id
ORDER BY i.started_at DESC 
LIMIT 10;
5. Facial Analytics - Real-Time Monitoring (IMPRESSIVE!) 🔥
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
  timestamp
FROM facial_analytics 
ORDER BY timestamp DESC 
LIMIT 15;
6. Certificate Validation Results (AI Feature) 🤖
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
7. Career Readiness Scores
SELECT 
  s.user_id,
  u.name as student_name,
  s.resume_score,
  s.academic_score,
  s.interview_score,
  s.readiness,
  s.level
FROM scores s
JOIN users u ON s.user_id = u.id
ORDER BY s.readiness DESC 
LIMIT 10;
8. Group Discussion Sessions
SELECT 
  gs.id,
  u.name as student_name,
  gs.topic_text,
  gs.status,
  gs.overall_score,
  gs.leadership_score,
  gs.communication_score,
  gs.started_at
FROM gd_sessions gs
JOIN users u ON gs.user_id = u.id
ORDER BY gs.started_at DESC 
LIMIT 10;
📸 ALTERNATIVE: If pgAdmin is Not Working
Option: Find PostgreSQL bin folder and add to PATH
Command
c:\Projects\job interview_job search_ performance analyzer

Get-ChildItem -Path "C:\Program Files\PostgreSQL" -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
ty FullName                                      C:\Program Files\PostgreSQL\18\bin\psql.exe
Perfect! Found it! Now you can use psql directly:

✅ SOLUTION: Use Full Path to psql
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cip_db
Or navigate to the folder first:

cd "C:\Program Files\PostgreSQL\18\bin"
psql -U postgres -d cip_db
🎯 RECOMMENDED FOR DEMO:
Use pgAdmin - It's visual and easier for judges to see the data in a nice table format!

Open pgAdmin 4
Connect to cip_db
Open Query Tool
Copy-paste the queries I provided above
Show judges the results in the nice grid view
The queries in demo_queries.sql are ready to use - just copy-paste them into pgAdmin's Query Tool! 🚀

Est. Credits Used: 0.51
Elapsed time: 34s


Checkpoint
Restore


Hey listen I don't know the password of my PG admin

Kiro
I can see from your screenshot that pgAdmin is asking for the PostgreSQL password for user "postgres". Let me help you find or reset it.

🔍 Try These Common Passwords First:
Based on your application.yml, try these:

cip123 (from your Spring Boot config)
postgres (default)
admin
root
Empty password (just click OK)
🔧 If None Work - Find Password from Your Running Application:
Your Spring Boot app is already connected to the database! Let's check the environment variables or config:

Read file(s)

application.yml
Perfect! According to your config, the default password is cip123

✅ TRY THIS PASSWORD: cip123
Type cip123 in the password field and click OK.

🔄 If That Doesn't Work - Alternative: Use Command Line Directly
Since we found psql, let's try connecting with the full path:

Command
c:\Projects\job interview_job search_ performance analyzer

$env:PGPASSWORD="cip123"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cip_db -c "\dt"
es -d cip_db -c "\dt"                                                 List of tables
 Schema |            Name            | Type  |  O
wner                                             --------+----------------------------+-------+---
-------                                           public | branch_questions           | table | po
stgres                                            public | certificate_results        | table | po
stgres                                            public | certificates               | table | po
stgres                                            public | company_questions          | table | po
stgres                                            public | custom_interview_answers   | table | po
stgres                                            public | custom_interview_attempts  | table | po
stgres                                            public | custom_interview_questions | table | po
stgres                                            public | custom_interviews          | table | po
stgres                                            public | facial_analytics           | table | po
stgres                                            public | flyway_schema_history      | table | po
stgres                                            public | gd_interactions            | table | po
stgres                                            public | gd_sessions                | table | po
stgres                                            public | gd_topics                  | table | po
stgres                                            public | interview_templates        | table | po
stgres                                            public | interviews                 | table | po
stgres                                            public | jobs                       | table | po
stgres                                            public | resumes                    | table | po
stgres                                            public | scores                     | table | po
stgres                                            public | student_profiles           | table | po
stgres                                            public | users                      | table | po
stgres                                           (20 rows)

🎉 PERFECT! The password is cip123 and it works!

✅ SOLUTION:
In pgAdmin, type password: cip123
Click OK
🚀 OR Use Command Line for Demo (Even Better!)
Since command line is working, you can show judges directly from CMD:

Open Command Prompt and run:
set PGPASSWORD=cip123
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cip_db
Then you'll be in the PostgreSQL shell and can run queries!

📊 Quick Demo Commands (Once Connected):
-- Show all tables
\dt

-- Show record counts
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM interviews) as interviews,
  (SELECT COUNT(*) FROM facial_analytics) as facial_data;

-- Show recent interviews
SELECT id, user_id, interview_mode, total_score, started_at 
FROM interviews 
ORDER BY started_at DESC 
LIMIT 5;

-- Show facial analytics
SELECT interview_id, confidence_score, emotion, stress_level 
FROM facial_analytics 
ORDER BY timestamp DESC 
LIMIT 10;
Password is: cip123 ✅

Est. Credits Used: 0.69
Elapsed time: 50s


Checkpoint
Restore
ndows PowerShell

Copyright (C) Microsoft Corporation. All rights reserved.

Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows

PS C:\Users\HP> psql -U postgres -d cip_db

Password for user postgres:

psql (18.1)

WARNING: Console code page (437) differs from Windows code page (1252)

         8-bit characters might not work correctly. See psql reference

         page "Notes for Windows users" for details.

Type "help" for help.

cip_db=# -- Show all tables

cip_db=# \dt

                     List of tables

 Schema |            Name            | Type  |  Owner

--------+----------------------------+-------+----------

 public | branch_questions           | table | postgres

 public | certificate_results        | table | postgres

 public | certificates               | table | postgres

 public | company_questions          | table | postgres

 public | custom_interview_answers   | table | postgres

 public | custom_interview_attempts  | table | postgres

 public | custom_interview_questions | table | postgres

 public | custom_interviews          | table | postgres

 public | facial_analytics           | table | postgres

 public | flyway_schema_history      | table | postgres

 public | gd_interactions            | table | postgres

 public | gd_sessions                | table | postgres

 public | gd_topics                  | table | postgres

 public | interview_templates        | table | postgres

 public | interviews                 | table | postgres

 public | jobs                       | table | postgres

 public | resumes                    | table | postgres

 public | scores                     | table | postgres

 public | student_profiles           | table | postgres

 public | users                      | table | postgres

(20 rows)

cip_db=#

cip_db=# -- Show record counts

cip_db=# SELECT

cip_db-#   (SELECT COUNT(*) FROM users) as users,

cip_db-#   (SELECT COUNT(*) FROM interviews) as interviews,

cip_db-#   (SELECT COUNT(*) FROM facial_analytics) as facial_data;

 users | interviews | facial_data

-------+------------+-------------

    10 |         87 |        8433

(1 row)

cip_db=#

cip_db=# -- Show recent interviews

cip_db=# SELECT id, user_id, interview_mode, total_score, started_at

cip_db-# FROM interviews

cip_db-# ORDER BY started_at DESC

cip_db-# LIMIT 5;

 id | user_id |  interview_mode  | total_score |         started_at

----+---------+------------------+-------------+----------------------------

 91 |       3 | RESUME_BASED     |             | 2026-05-07 15:01:07.948585

 90 |       3 | COMPANY_SPECIFIC |             | 2026-05-07 14:02:22.032217

 89 |       3 | RESUME_BASED     |             | 2026-05-07 13:59:27.501018

 88 |       3 | RESUME_BASED     |             | 2026-05-07 12:00:26.137791

 87 |       3 | RESUME_BASED     |             | 2026-05-07 11:00:17.28609

(5 rows)

cip_db=#

cip_db=# -- Show facial analytics

cip_db=# SELECT interview_id, confidence_score, emotion, stress_level

cip_db-# FROM facial_analytics

cip_db-# ORDER BY timestamp DESC

cip_db-# LIMIT 10;

 interview_id | confidence_score |  emotion  | stress_level

--------------+------------------+-----------+--------------

           91 |                  | CONFIDENT |

           91 |                  | CONFIDENT |

           91 |                  | CONFIDENT |

           91 |                  | CONFIDENT |

           91 |                  | CONFIDENT |

           91 |                  | CONFIDENT |

           91 |                  | CONFIDENT |

           91 |                  | CONFIDENT |

           91 |                  | CONFIDENT |

           91 |                  | CONFIDENT |

(10 rows)

cip_db=#

OK now tell how to do I are all questions answers or received in our database

Kiro
Perfect! You're connected! 🎉 Now let me show you how to see the questions and answers stored in your database.

Based on your schema, questions and answers are stored as JSON data inside the interviews table. Let me show you how to view them:

📝 VIEW QUESTIONS AND ANSWERS:
Copy-paste these queries one by one:

1. Show Interview Questions (JSON format)
SELECT 
  id as interview_id,
  user_id,
  interview_mode,
  round_type,
  jsonb_array_length(questions::jsonb) as total_questions,
  questions
FROM interviews 
WHERE questions IS NOT NULL
ORDER BY started_at DESC 
LIMIT 3;
2. Show Interview Answers (JSON format)
SELECT 
  id as interview_id,
  user_id,
  interview_mode,
  jsonb_array_length(answers::jsonb) as total_answers,
  answers
FROM interviews 
WHERE answers IS NOT NULL
ORDER BY started_at DESC 
LIMIT 3;
3. Show Questions AND Answers Together
SELECT 
  id as interview_id,
  user_id,
  interview_mode,
  round_type,
  company,
  total_score,
  jsonb_array_length(questions::jsonb) as num_questions,
  jsonb_array_length(answers::jsonb) as num_answers,
  started_at
FROM interviews 
WHERE questions IS NOT NULL AND answers IS NOT NULL
ORDER BY started_at DESC 
LIMIT 5;
4. Extract Individual Questions (Pretty Format)
SELECT 
  i.id as interview_id,
  u.name as student_name,
  i.interview_mode,
  jsonb_array_elements(i.questions::jsonb)->>'question' as question_text,
  jsonb_array_elements(i.questions::jsonb)->>'difficulty' as difficulty,
  jsonb_array_elements(i.questions::jsonb)->>'topic' as topic
FROM interviews i
JOIN users u ON i.user_id = u.id
WHERE i.questions IS NOT NULL
LIMIT 10;
5. Extract Individual Answers (Pretty Format)
SELECT 
  i.id as interview_id,
  u.name as student_name,
  jsonb_array_elements(i.answers::jsonb)->>'answer' as answer_text,
  jsonb_array_elements(i.answers::jsonb)->>'score' as score,
  jsonb_array_elements(i.answers::jsonb)->>'timeTaken' as time_taken
FROM interviews i
JOIN users u ON i.user_id = u.id
WHERE i.answers IS NOT NULL
LIMIT 10;
6. Complete Interview Session (Questions + Answers + Scores)
SELECT 
  i.id,
  u.name as student,
  i.interview_mode,
  i.round_type,
  i.company,
  i.total_score,
  i.status,
  i.questions::jsonb as all_questions,
  i.answers::jsonb as all_answers,
  i.started_at
FROM interviews i
JOIN users u ON i.user_id = u.id
WHERE i.id = 91
LIMIT 1;
🎯 FOR DEMO - BEST QUERIES TO SHOW JUDGES:
Show Complete Interview Data:
SELECT 
  i.id,
  u.name,
  u.email,
  i.interview_mode,
  i.round_type,
  i.company,
  i.job_role,
  i.difficulty,
  i.persona,
  i.total_score,
  i.total_questions,
  i.answered_questions,
  i.status,
  i.started_at,
  i.completed_at
FROM interviews i
JOIN users u ON i.user_id = u.id
ORDER BY i.started_at DESC
LIMIT 10;
Show Users:
SELECT id, name, email, role, active, created_at 
FROM users 
ORDER BY created_at DESC;
Show Certificates:
SELECT 
  c.id,
  u.name as student_name,
  c.file_name,
  c.status,
  cr.authenticity_score,
  cr.confidence_level,
  c.created_at
FROM certificates c
JOIN users u ON c.user_id = u.id
LEFT JOIN certificate_results cr ON cr.certificate_id = c.id
ORDER BY c.created_at DESC
LIMIT 10;
Show Resumes:
SELECT 
  r.id,
  u.name as student_name,
  r.file_name,
  r.parse_status,
  r.resume_score,
  r.uploaded_at
FROM resumes r
JOIN users u ON r.user_id = u.id
ORDER BY r.uploaded_at DESC
LIMIT 10;
**Show Career
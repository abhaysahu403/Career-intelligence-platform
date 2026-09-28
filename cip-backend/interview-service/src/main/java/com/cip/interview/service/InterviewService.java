package com.cip.interview.service;

import com.cip.common.events.CipEvent;
import com.cip.common.events.KafkaTopics;
import com.cip.common.exception.CipException;
import com.cip.interview.dto.InterviewDtos;
import com.cip.interview.entity.Interview;
import com.cip.interview.repository.InterviewRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final KafkaTemplate<String, CipEvent> kafkaTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public InterviewDtos.InterviewResponse startInterview(Long userId,
                                                          InterviewDtos.StartRequest request) {
        try {
            List<Map<String, Object>> questions = normalizeQuestionList(request.getQuestions());
            int numQuestions = request.getNumberOfQuestions() != null
                    ? request.getNumberOfQuestions()
                    : questions.size();

            Interview interview = Interview.builder()
                    .userId(userId)
                    .type(request.getType() != null ? request.getType() : Interview.InterviewType.TECHNICAL)
                    .jobRole(request.getJobRole())
                    .questions(objectMapper.writeValueAsString(questions))
                    .answers(objectMapper.writeValueAsString(new ArrayList<>()))
                    .totalQuestions(numQuestions)
                    .answeredQuestions(0)
                    .status(Interview.InterviewStatus.IN_PROGRESS)
                    .build();

            interview = interviewRepository.save(interview);
            log.info("Interview started: id={}, userId={}, type={}", interview.getId(), userId, interview.getType());
            return toResponse(interview);
        } catch (Exception e) {
            log.error("Failed to start interview", e);
            throw new CipException("Failed to start interview: " + e.getMessage(), 500);
        }
    }

    @Transactional
    public InterviewDtos.InterviewResponse submitAnswer(Long userId,
                                                        InterviewDtos.AnswerRequest request) {
        try {
            Interview interview = interviewRepository.findByIdAndUserId(request.getInterviewId(), userId)
                    .orElseThrow(() -> CipException.notFound("Interview"));

            if (interview.getStatus() != Interview.InterviewStatus.IN_PROGRESS) {
                throw CipException.badRequest("Interview is not in progress");
            }

            List<Map<String, Object>> answers = objectMapper.readValue(
                    interview.getAnswers() != null ? interview.getAnswers() : "[]",
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class)
            );

            Map<String, Object> answerEntry = new LinkedHashMap<>();
            answerEntry.put("questionIndex", request.getQuestionIndex());
            answerEntry.put("question", request.getQuestion());
            answerEntry.put("answer", request.getAnswer());
            answerEntry.put("timeTakenSeconds", request.getTimeTakenSeconds() != null ? request.getTimeTakenSeconds() : 0);
            answerEntry.put("score", request.getScore());
            answerEntry.put("topic", request.getTopic());
            answerEntry.put("difficulty", request.getDifficulty());
            answerEntry.put("feedback", request.getFeedback());
            answers.add(answerEntry);

            interview.setAnswers(objectMapper.writeValueAsString(answers));
            interview.setAnsweredQuestions(answers.size());
            interview.setQuestions(mergeQuestion(interview.getQuestions(), request));
            interview = interviewRepository.save(interview);
            return toResponse(interview);
        } catch (Exception e) {
            log.error("Failed to submit answer", e);
            throw CipException.badRequest("Failed to submit answer: " + e.getMessage());
        }
    }

    @Transactional
    public InterviewDtos.InterviewResponse endInterview(Long userId, Long interviewId) {
        try {
            Interview interview = interviewRepository.findByIdAndUserId(interviewId, userId)
                    .orElseThrow(() -> CipException.notFound("Interview"));

            if (interview.getStatus() != Interview.InterviewStatus.IN_PROGRESS) {
                throw CipException.badRequest("Interview is not in progress");
            }

            double totalScore = computeInterviewScore(interview);
            interview.setTotalScore(totalScore);
            interview.setStatus(Interview.InterviewStatus.COMPLETED);
            interview.setCompletedAt(LocalDateTime.now());
            interview.setFeedback(objectMapper.writeValueAsString(buildSummary(interview, totalScore)));
            interview = interviewRepository.save(interview);

            CipEvent event = CipEvent.interviewCompleted(userId, interviewId, totalScore);
            kafkaTemplate.send(KafkaTopics.INTERVIEW_COMPLETED, userId.toString(), event);
            log.info("Interview completed: id={}, userId={}, score={}", interviewId, userId, totalScore);

            return toResponse(interview);
        } catch (Exception e) {
            log.error("Failed to end interview", e);
            throw CipException.badRequest("Failed to end interview: " + e.getMessage());
        }
    }

    public InterviewDtos.InterviewResponse getResult(Long userId, Long interviewId) {
        Interview interview = interviewRepository.findByIdAndUserId(interviewId, userId)
                .orElseThrow(() -> CipException.notFound("Interview"));
        return toResponse(interview);
    }

    public List<InterviewDtos.InterviewResponse> getHistory(Long userId) {
        return interviewRepository.findByUserIdOrderByStartedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> normalizeQuestionList(Object questionsObj) {
        if (!(questionsObj instanceof List<?> list)) {
            return new ArrayList<>();
        }
        List<Map<String, Object>> questions = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?> map) {
                questions.add(new LinkedHashMap<>((Map<String, Object>) map));
            }
        }
        return questions;
    }

    private String mergeQuestion(String existingQuestionsJson, InterviewDtos.AnswerRequest request) {
        try {
            List<Map<String, Object>> questions = objectMapper.readValue(
                    existingQuestionsJson != null ? existingQuestionsJson : "[]",
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class)
            );
            
            boolean alreadyPresent = questions.stream().anyMatch(item ->
                    request.getQuestionIndex() != null && request.getQuestionIndex().equals(item.get("index")));
            
            if (!alreadyPresent && request.getQuestion() != null && !request.getQuestion().isBlank()) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("index", request.getQuestionIndex());
                entry.put("question", request.getQuestion());
                entry.put("topic", request.getTopic());
                entry.put("difficulty", request.getDifficulty());
                questions.add(entry);
            }
            return objectMapper.writeValueAsString(questions);
        } catch (Exception e) {
            log.error("Failed to merge question", e);
            return existingQuestionsJson;
        }
    }

    private double computeInterviewScore(Interview interview) {
        try {
            if (interview.getAnswers() == null || interview.getAnswers().isEmpty()) {
                return 0;
            }
            List<Map<String, Object>> answers = objectMapper.readValue(
                    interview.getAnswers(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class)
            );
            
            double sum = answers.stream()
                    .mapToDouble(map -> {
                        Object s = map.get("score");
                        return s instanceof Number ? ((Number) s).doubleValue() : 0;
                    })
                    .sum();
            return answers.isEmpty() ? 0 : sum / answers.size();
        } catch (Exception e) {
            log.error("Failed to compute score", e);
            return 0;
        }
    }

    private Map<String, Object> buildSummary(Interview interview, double score) {
        List<String> weakTopics = new ArrayList<>();
        Object latestFeedback = null;
        try {
            if (interview.getAnswers() != null && !interview.getAnswers().isEmpty()) {
                List<Map<String, Object>> answers = objectMapper.readValue(
                        interview.getAnswers(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class)
                );
                for (Map<String, Object> map : answers) {
                    Object itemScore = map.get("score");
                    Object topic = map.get("topic");
                    if (itemScore instanceof Number number && number.doubleValue() < 70 && topic != null) {
                        weakTopics.add(topic.toString());
                    }
                    if (map.get("feedback") != null) {
                        latestFeedback = map.get("feedback");
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse answers in buildSummary", e);
        }
        return Map.of(
                "overallScore", score,
                "completedQuestions", interview.getAnsweredQuestions(),
                "totalQuestions", interview.getTotalQuestions(),
                "weakTopics", weakTopics.stream().distinct().toList(),
                "latestFeedback", latestFeedback != null ? latestFeedback : ""
        );
    }

    private InterviewDtos.InterviewResponse toResponse(Interview i) {
        Object questions = parseJsonField(i.getQuestions());
        Object answers = parseJsonField(i.getAnswers());
        Object feedback = parseJsonField(i.getFeedback());
        
        return InterviewDtos.InterviewResponse.builder()
                .id(i.getId())
                .userId(i.getUserId())
                .type(i.getType())
                .status(i.getStatus())
                .jobRole(i.getJobRole())
                .questions(questions)
                .answers(answers)
                .totalScore(i.getTotalScore())
                .totalQuestions(i.getTotalQuestions())
                .answeredQuestions(i.getAnsweredQuestions())
                .feedback(feedback)
                .startedAt(i.getStartedAt())
                .completedAt(i.getCompletedAt())
                .build();
    }
    
    private Object parseJsonField(String jsonString) {
        if (jsonString == null || jsonString.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(jsonString, Object.class);
        } catch (Exception e) {
            log.warn("Failed to parse JSON field: {}", e.getMessage());
            return jsonString;
        }
    }
}

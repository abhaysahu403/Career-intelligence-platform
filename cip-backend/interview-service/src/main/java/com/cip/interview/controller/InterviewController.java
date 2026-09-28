package com.cip.interview.controller;

import com.cip.common.dto.ApiResponse;
import com.cip.interview.dto.InterviewDtos;
import com.cip.interview.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<InterviewDtos.InterviewResponse>> start(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody InterviewDtos.StartRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Interview started",
                interviewService.startInterview(userId, request)));
    }

    @PostMapping("/v3/start")
    public ResponseEntity<ApiResponse<InterviewDtos.InterviewResponse>> startV3(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody InterviewDtos.StartRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Interview started",
                interviewService.startInterview(userId, request)));
    }

    @GetMapping("/v3/config")
    public ResponseEntity<Object> getConfigV3() {
        return ResponseEntity.ok(java.util.Map.of(
            "success", true,
            "data", java.util.Map.of(
                "companies", java.util.List.of("Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Tesla", "Uber", "Airbnb", "Stripe"),
                "roles", java.util.List.of("Software Engineer", "Backend Developer", "Frontend Developer", "Full Stack Developer", "DevOps Engineer", "Data Engineer", "ML Engineer", "Cloud Architect"),
                "branches", java.util.List.of("Computer Science", "Information Technology", "Electronics", "Electrical", "Mechanical", "Civil"),
                "difficulties", java.util.List.of("EASY", "MEDIUM", "HARD", "FAANG"),
                "personas", java.util.List.of("FRIENDLY_HR", "STRICT_TECHNICAL", "STARTUP_FOUNDER", "FAANG_INTERVIEWER", "SENIOR_ARCHITECT"),
                "durations", java.util.List.of(15, 30, 45, 60, 90)
            )
        ));
    }

    @PostMapping("/answer")
    public ResponseEntity<ApiResponse<InterviewDtos.InterviewResponse>> answer(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody InterviewDtos.AnswerRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Answer recorded",
                interviewService.submitAnswer(userId, request)));
    }

    @PostMapping("/end")
    public ResponseEntity<ApiResponse<InterviewDtos.InterviewResponse>> end(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Long interviewId) {
        return ResponseEntity.ok(ApiResponse.success("Interview completed",
                interviewService.endInterview(userId, interviewId)));
    }

    @GetMapping("/result/{id}")
    public ResponseEntity<ApiResponse<InterviewDtos.InterviewResponse>> getResult(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(interviewService.getResult(userId, id)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<InterviewDtos.InterviewResponse>>> history(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.success(interviewService.getHistory(userId)));
    }
}

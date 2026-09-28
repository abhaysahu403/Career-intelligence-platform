package com.cip.resume.service;

import com.cip.common.exception.CipException;
import com.cip.resume.entity.Resume;
import com.cip.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final StorageService storageService;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_TYPES = List.of("application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    @Transactional
    public Resume uploadResume(Long userId, MultipartFile file) throws IOException {
        validateFile(file);

        String fileUrl = storageService.store(file, userId);
        
        // Extract text from file for ML processing
        String resumeText = extractText(file);

        Resume resume = Resume.builder()
                .userId(userId)
                .fileName(file.getOriginalFilename())
                .fileUrl(fileUrl)
                .fileSizeBytes(file.getSize())
                .contentType(file.getContentType())
                .parseStatus(Resume.ParseStatus.PENDING)
                .build();

        resume = resumeRepository.save(resume);

        log.info("Resume uploaded for userId={}, resumeId={}, textLength={}", 
                 userId, resume.getId(), resumeText.length());

        return resume;
    }

    @Transactional
    public Resume uploadResumeText(Long userId, String fileName, String resumeText) throws IOException {
        if (resumeText == null || resumeText.trim().isEmpty()) {
            throw CipException.badRequest("Resume text cannot be empty");
        }

        Resume resume = Resume.builder()
                .userId(userId)
                .fileName(fileName)
                .fileUrl("text://" + fileName)
                .fileSizeBytes((long) resumeText.length())
                .contentType("text/plain")
                .parseStatus(Resume.ParseStatus.COMPLETED)
                .parsedData(null)  // Don't set parsedData to avoid serialization issues
                .build();

        resume = resumeRepository.save(resume);

        log.info("Resume text uploaded for userId={}, resumeId={}, textLength={}", 
                 userId, resume.getId(), resumeText.length());

        return resume;
    }
    
    private String extractText(MultipartFile file) throws IOException {
        String contentType = file.getContentType() != null ? file.getContentType() : "";
        byte[] bytes = file.getBytes();

        if ("application/pdf".equalsIgnoreCase(contentType)) {
            try (PDDocument document = PDDocument.load(bytes)) {
                return normalizeExtractedText(new PDFTextStripper().getText(document));
            }
        }

        if ("application/vnd.openxmlformats-officedocument.wordprocessingml.document".equalsIgnoreCase(contentType)) {
            try (XWPFDocument document = new XWPFDocument(new ByteArrayInputStream(bytes))) {
                return normalizeExtractedText(document.getParagraphs().stream()
                        .map(paragraph -> paragraph.getText() == null ? "" : paragraph.getText())
                        .reduce("", (left, right) -> left + System.lineSeparator() + right));
            }
        }

        if ("application/msword".equalsIgnoreCase(contentType)) {
            throw CipException.badRequest("Legacy .doc parsing is not supported yet. Upload PDF or DOCX.");
        }

        throw CipException.badRequest("Unsupported resume format");
    }

    private String normalizeExtractedText(String text) {
        String normalized = text == null ? "" : text.replace('\u0000', ' ')
                .replaceAll("\\s+", " ")
                .trim();
        if (normalized.isBlank()) {
            throw CipException.badRequest("Could not extract text from resume");
        }
        return normalized;
    }

    public List<Resume> getResumes(Long userId) {
        return resumeRepository.findByUserIdOrderByUploadedAtDesc(userId);
    }

    public Resume getLatestResume(Long userId) {
        return resumeRepository.findTopByUserIdOrderByUploadedAtDesc(userId)
                .orElseThrow(() -> CipException.notFound("Resume"));
    }

    /** Called by Kafka consumer when ML service finishes parsing */
    @Transactional
    public void updateParsedData(String resumeId, Object parsedData, Double score) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> CipException.notFound("Resume"));
        try {
            resume.setParsedData(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(parsedData));
        } catch (Exception e) {
            log.error("Failed to serialize parsed data", e);
        }
        resume.setResumeScore(score);
        resume.setParseStatus(Resume.ParseStatus.COMPLETED);
        resumeRepository.save(resume);
        log.info("Resume {} parsed with score={}", resumeId, score);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) throw CipException.badRequest("File is empty");
        if (file.getSize() > MAX_FILE_SIZE) throw CipException.badRequest("File too large (max 10MB)");
        if (!ALLOWED_TYPES.contains(file.getContentType()))
            throw CipException.badRequest("Only PDF and Word documents are allowed");
    }
}

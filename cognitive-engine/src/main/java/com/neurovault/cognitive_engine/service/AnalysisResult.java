package com.neurovault.cognitive_engine.service;

import java.util.List;

public record AnalysisResult(
        String summary,
        List<String> keywords
) {
}
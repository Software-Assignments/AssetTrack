package com.example.assettrack.dto.request;

import com.example.assettrack.domain.ReportSeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConditionReportRequestDto {

    @NotNull(message = "Asset ID is required")
    private Long assetId;

    @NotBlank(message = "Issue description cannot be empty")
    private String issueDescription;

    @NotNull(message = "Severity is required")
    private ReportSeverity severity;
}
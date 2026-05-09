package com.example.assettrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ConditionReportResponseDTO {
    private Long id;
    private Long assetId;
    private String assetSerialNumber;
    private String assetBrand;
    private String assetModel;
    private Long reportedById;
    private String reportedByEmail;
    private String reportedByName;
    private String conditionStatus;
    private String notes;
    private LocalDateTime reportedAt;
}

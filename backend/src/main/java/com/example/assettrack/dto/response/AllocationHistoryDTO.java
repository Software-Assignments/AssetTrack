package com.example.assettrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class AllocationHistoryDTO {
    private Long id;
    private Long assetId;
    private String assetSerialNumber;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private LocalDate assignDate;
    private LocalDate returnDate;
}

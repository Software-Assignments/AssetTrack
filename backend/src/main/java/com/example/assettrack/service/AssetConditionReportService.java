package com.example.assettrack.service;

import com.example.assettrack.domain.Asset;
import com.example.assettrack.domain.ConditionReport;
import com.example.assettrack.domain.User;
import com.example.assettrack.dto.request.ConditionReportRequestDto;
import com.example.assettrack.dto.response.ConditionReportResponseDTO;
import com.example.assettrack.exception.NotFoundException;
import com.example.assettrack.repository.AssetConditionReportRepository;
import com.example.assettrack.repository.AssetRepository;
import com.example.assettrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetConditionReportService {

    private final AssetConditionReportRepository reportRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    @Transactional
    public ConditionReportResponseDTO submitReport(ConditionReportRequestDto dto, Long currentUserId) {
        Asset asset = assetRepository.findById(dto.getAssetId())
                .orElseThrow(() -> new NotFoundException("Asset not found: " + dto.getAssetId()));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException("User not found: " + currentUserId));

        ConditionReport report = new ConditionReport();
        report.setAsset(asset);
        report.setReportedBy(user);
        report.setNotes(dto.getIssueDescription());
        report.setConditionStatus(dto.getSeverity() != null ? dto.getSeverity().name() : null);
        report.setReportedAt(LocalDateTime.now());

        return toDto(reportRepository.save(report));
    }

    @Transactional(readOnly = true)
    public List<ConditionReportResponseDTO> getAllReports() {
        return reportRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConditionReportResponseDTO> getReportsByAssetId(Long assetId) {
        return reportRepository.findByAsset_IdOrderByReportedAtDesc(assetId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConditionReportResponseDTO> getReportsByUserId(Long userId) {
        return reportRepository.findByReportedBy_IdOrderByReportedAtDesc(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private ConditionReportResponseDTO toDto(ConditionReport r) {
        return ConditionReportResponseDTO.builder()
                .id(r.getId())
                .assetId(r.getAsset().getId())
                .assetSerialNumber(r.getAsset().getSerialNumber())
                .assetBrand(r.getAsset().getBrand())
                .assetModel(r.getAsset().getModel())
                .reportedById(r.getReportedBy().getId())
                .reportedByEmail(r.getReportedBy().getEmail())
                .reportedByName(r.getReportedBy().getFullName())
                .conditionStatus(r.getConditionStatus())
                .notes(r.getNotes())
                .reportedAt(r.getReportedAt())
                .build();
    }
}
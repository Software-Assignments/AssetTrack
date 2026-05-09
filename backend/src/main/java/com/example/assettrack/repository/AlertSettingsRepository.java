package com.example.assettrack.repository;

import com.example.assettrack.domain.AlertSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlertSettingsRepository extends JpaRepository<AlertSettings, Long> {
}

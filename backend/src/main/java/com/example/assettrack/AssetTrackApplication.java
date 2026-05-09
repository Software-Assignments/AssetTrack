package com.example.assettrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AssetTrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(AssetTrackApplication.class, args);
    }
}


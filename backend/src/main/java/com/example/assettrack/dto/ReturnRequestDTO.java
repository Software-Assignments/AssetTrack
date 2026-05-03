package com.example.assettrack.dto;

import java.time.LocalDate;

public class ReturnRequestDTO {

    private LocalDate returnDate;

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }
}


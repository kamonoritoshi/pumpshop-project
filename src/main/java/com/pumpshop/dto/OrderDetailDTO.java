package com.pumpshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailDTO {
    private Long id;
    private String productId;
    private String productName;
    private String productImage;
    private Double price;
    private Integer quantity;
}

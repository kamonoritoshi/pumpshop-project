package com.pumpshop.dto;

import java.util.Date;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long id;
    private Date orderDate;
    private String status;
    private Double totalAmount;
    private String receiverName;
    private String receiverPhone;
    private String deliveryAddress;
    private List<OrderDetailDTO> orderDetails;
}

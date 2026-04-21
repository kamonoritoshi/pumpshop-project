package com.pumpshop.service;

import com.pumpshop.dto.OrderDTO;
import com.pumpshop.entity.Order;
import java.util.Optional;

public interface OrderService {
    Order createOrder(Order order);
    Optional<OrderDTO> lookupOrder(Long id, String receiverPhone);
}

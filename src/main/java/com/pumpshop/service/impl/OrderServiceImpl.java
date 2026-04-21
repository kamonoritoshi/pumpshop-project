package com.pumpshop.service.impl;

import com.pumpshop.dto.OrderDTO;
import com.pumpshop.dto.OrderDetailDTO;
import com.pumpshop.entity.Order;
import com.pumpshop.repository.OrderRepository;
import com.pumpshop.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public Order createOrder(Order order) {
        if (order.getOrderDetails() != null) {
            order.getOrderDetails().forEach(detail -> detail.setOrder(order));
        }

        if (order.getOrderDate() == null) {
            order.setOrderDate(new Date());
        }

        return orderRepository.save(order);
    }

    @Override
    public Optional<OrderDTO> lookupOrder(Long id, String receiverPhone) {
        Optional<Order> orderOpt = orderRepository.findByIdAndReceiverPhone(id, receiverPhone);
        return orderOpt.map(this::convertToDTO);
    }

    private OrderDTO convertToDTO(Order order) {
        List<OrderDetailDTO> details = order.getOrderDetails().stream().map(detail -> {
            OrderDetailDTO detailDTO = new OrderDetailDTO();
            detailDTO.setId(detail.getId());
            if (detail.getProduct() != null) {
                detailDTO.setProductId(detail.getProduct().getId());
                detailDTO.setProductName(detail.getProduct().getName());
                detailDTO.setProductImage(detail.getProduct().getImage());
            }
            detailDTO.setPrice(detail.getPrice());
            detailDTO.setQuantity(detail.getQuantity());
            return detailDTO;
        }).collect(Collectors.toList());

        return new OrderDTO(
                order.getId(),
                order.getOrderDate(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getReceiverName(),
                order.getReceiverPhone(),
                order.getDeliveryAddress(),
                details
        );
    }
}

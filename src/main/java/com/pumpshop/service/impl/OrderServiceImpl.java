package com.pumpshop.service.impl;

import com.pumpshop.dto.OrderDTO;
import com.pumpshop.dto.OrderDetailDTO;
import com.pumpshop.entity.Order;
import com.pumpshop.entity.OrderDetail;
import com.pumpshop.entity.Product;
import com.pumpshop.repository.OrderRepository;
import com.pumpshop.repository.ProductRepository;
import com.pumpshop.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    @Transactional
    public Order createOrder(Order order) {
        if (order.getOrderDetails() != null) {
            for (OrderDetail detail : order.getOrderDetails()) {
                // Truy xuất Product từ ProductRepository dựa trên productId
                Product product = productRepository.findById(detail.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại ID: " + detail.getProduct().getId()));

                // Kiểm tra tồn kho (Inventory Check)
                if (product.getQuantity() < detail.getQuantity()) {
                    throw new RuntimeException("Sản phẩm [" + product.getName() + "] không đủ số lượng trong kho");
                }

                // Cập nhật kho (Update Stock)
                product.setQuantity(product.getQuantity() - detail.getQuantity());
                productRepository.save(product);

                // Liên kết detail với order
                detail.setOrder(order);
            }
        }

        // Hoàn thiện đơn hàng
        order.setOrderDate(new Date());
        order.setStatus("PENDING");

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

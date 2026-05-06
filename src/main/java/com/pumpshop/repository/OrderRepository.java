package com.pumpshop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pumpshop.entity.Order;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>{
    Optional<Order> findByIdAndReceiverPhone(Long id, String receiverPhone);
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
}

package com.pumpshop.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pumpshop.dto.OrderDTO;
import com.pumpshop.entity.Order;
import com.pumpshop.service.OrderService;

import java.util.Optional;
import java.net.URI;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> create(@RequestBody Order order) {
        Order savedOrder = orderService.createOrder(order);
        return ResponseEntity.created(URI.create("/api/v1/orders/" + savedOrder.getId())).body(savedOrder);
    }

    @GetMapping("/lookup")
    public ResponseEntity<OrderDTO> lookupOrder(
            @RequestParam("id") Long id,
            @RequestParam("phone") String phone) {
        Optional<OrderDTO> orderDTOOpt = orderService.lookupOrder(id, phone);
        if (orderDTOOpt.isPresent()) {
            return ResponseEntity.ok(orderDTOOpt.get());
        }
        return ResponseEntity.notFound().build();
    }
}

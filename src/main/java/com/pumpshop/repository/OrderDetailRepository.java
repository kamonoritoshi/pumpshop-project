package com.pumpshop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pumpshop.entity.OrderDetail;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long>{

}

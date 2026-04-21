package com.pumpshop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pumpshop.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

}

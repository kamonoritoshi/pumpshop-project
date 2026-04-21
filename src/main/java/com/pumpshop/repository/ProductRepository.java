package com.pumpshop.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.pumpshop.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
	@Query("SELECT p FROM Product p WHERE p.name LIKE %:kw% OR p.brand LIKE %:kw%")
	Page<Product> findAllByNameOrBrand(@Param("kw") String kw, Pageable pageable);

	List<Product> findByBrand(String brand);

	List<Product> findByPriceLessThan(Double price);
}

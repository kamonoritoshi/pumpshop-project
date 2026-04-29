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
	@Query("SELECT p FROM Product p WHERE " +
	       "(:kw IS NULL OR p.name LIKE %:kw% OR p.brand LIKE %:kw% OR p.description LIKE %:kw%) AND " +
	       "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
	       "(:brand IS NULL OR p.brand = :brand) AND " +
	       "(:minPower IS NULL OR p.powerKw >= :minPower) AND " +
	       "(:maxPower IS NULL OR p.powerKw <= :maxPower) AND " +
	       "(:minHead IS NULL OR p.headMax >= :minHead) AND " +
	       "(:maxHead IS NULL OR p.headMax <= :maxHead)")
	Page<Product> findWithFilters(
			@Param("kw") String kw,
			@Param("categoryId") Long categoryId,
			@Param("brand") String brand,
			@Param("minPower") Double minPower,
			@Param("maxPower") Double maxPower,
			@Param("minHead") Double minHead,
			@Param("maxHead") Double maxHead,
			Pageable pageable);

	List<Product> findByBrand(String brand);

	List<Product> findByPriceLessThan(Double price);

	Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

	Page<Product> findByPowerKwBetween(Double min, Double max, Pageable pageable);

	Page<Product> findByPriceBetween(Double min, Double max, Pageable pageable);
}

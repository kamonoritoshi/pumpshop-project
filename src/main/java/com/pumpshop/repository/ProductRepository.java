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
	       "(:kw IS NULL OR LOWER(CAST(p.name AS string)) LIKE LOWER(CAST(CONCAT('%', :kw, '%') AS string)) OR LOWER(CAST(p.brand AS string)) LIKE LOWER(CAST(CONCAT('%', :kw, '%') AS string)) OR LOWER(CAST(p.description AS string)) LIKE LOWER(CAST(CONCAT('%', :kw, '%') AS string))) AND " +
	       "(:categoryIds IS NULL OR p.category.id IN :categoryIds) AND " +
	       "(:brands IS NULL OR p.brand IN :brands) AND " +
	       "(:minPower IS NULL OR p.powerKw >= :minPower) AND " +
	       "(:maxPower IS NULL OR p.powerKw <= :maxPower) AND " +
	       "(:minHead IS NULL OR p.headMax >= :minHead) AND " +
	       "(:maxHead IS NULL OR p.headMax <= :maxHead)")
	Page<Product> findWithFilters(
			@Param("kw") String kw,
			@Param("categoryIds") List<Long> categoryIds,
			@Param("brands") List<String> brands,
			@Param("minPower") Double minPower,
			@Param("maxPower") Double maxPower,
			@Param("minHead") Double minHead,
			@Param("maxHead") Double maxHead,
			Pageable pageable);

	@Query("SELECT DISTINCT p.brand FROM Product p WHERE p.brand IS NOT NULL ORDER BY p.brand")
	List<String> findAllBrands();

	List<Product> findByBrand(String brand);

	List<Product> findByPriceLessThan(Double price);

	Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

	Page<Product> findByPowerKwBetween(Double min, Double max, Pageable pageable);

	Page<Product> findByPriceBetween(Double min, Double max, Pageable pageable);
}

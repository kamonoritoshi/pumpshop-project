package com.pumpshop.service;

import org.springframework.data.domain.Page;
import com.pumpshop.entity.Product;

public interface ProductService {
	Page<Product> getProducts(int page, int size, String keyword);

	Product getProductById(String id);

	Product saveProduct(Product product);

	void deleteProduct(String id);

	Page<Product> getProductsByCategory(Long categoryId, int page, int size);

	Page<Product> getProductsByPowerRange(Double minPower, Double maxPower, int page, int size);

	Page<Product> getProductsByPriceRange(Double minPrice, Double maxPrice, int page, int size);
	
	Page<Product> getProductsAdvanced(String kw, Long categoryId, java.util.List<String> brands, Double minPower, Double maxPower, Double minHead, Double maxHead, int page, int size);

	java.util.List<String> getAllBrands();
}

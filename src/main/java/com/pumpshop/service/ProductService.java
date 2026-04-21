package com.pumpshop.service;

import org.springframework.data.domain.Page;
import com.pumpshop.entity.Product;

public interface ProductService {
	Page<Product> getProducts(int page, int size, String keyword);

	Product getProductById(String id);

	Product saveProduct(Product product);

	void deleteProduct(String id);
}

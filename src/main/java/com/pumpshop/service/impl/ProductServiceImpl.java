package com.pumpshop.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.pumpshop.entity.Product;
import com.pumpshop.repository.ProductRepository;
import com.pumpshop.service.ProductService;

@Service
public class ProductServiceImpl implements ProductService {
	@Autowired
	private ProductRepository productRepository;

	@Override
	public Page<Product> getProducts(int page, int size, String keyword) {
		Pageable pageable = PageRequest.of(page, size);
		if (keyword != null && !keyword.isEmpty()) {
			return productRepository.findAllByNameOrBrand(keyword, pageable);
		}
		return productRepository.findAll(pageable);
	}

	@Override
	public Product getProductById(String id) {
		String realId = id.replace("_", "/");
		System.out.println("ID sau khi đổi ngược lại để tìm trong DB: " + realId);
		return productRepository.findById(realId).orElse(null);
	}

	@Override
	public Product saveProduct(Product product) {
		return productRepository.save(product);
	}

	@Override
	public void deleteProduct(String id) {
		productRepository.deleteById(id);
	}
}

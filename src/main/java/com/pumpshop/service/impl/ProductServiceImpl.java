package com.pumpshop.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.pumpshop.entity.Category;
import com.pumpshop.entity.Product;
import com.pumpshop.repository.CategoryRepository;
import com.pumpshop.repository.ProductRepository;
import com.pumpshop.service.ProductService;

@Service
public class ProductServiceImpl implements ProductService {
	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private CategoryRepository categoryRepository;

	@Override
	public Page<Product> getProducts(int page, int size, String keyword) {
		Pageable pageable = PageRequest.of(page, size);
		return productRepository.findWithFilters(keyword, null, null, null, null, null, null, pageable);
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

	@Override
	public Page<Product> getProductsByCategory(Long categoryId, int page, int size) {
		List<Long> categoryIds = getAllCategoryIds(categoryId);
		return productRepository.findWithFilters(null, categoryIds, null, null, null, null, null, PageRequest.of(page, size));
	}

	@Override
	public Page<Product> getProductsByPowerRange(Double minPower, Double maxPower, int page, int size) {
		return productRepository.findByPowerKwBetween(minPower, maxPower, PageRequest.of(page, size));
	}

	@Override
	public Page<Product> getProductsByPriceRange(Double minPrice, Double maxPrice, int page, int size) {
		return productRepository.findByPriceBetween(minPrice, maxPrice, PageRequest.of(page, size));
	}

	@Override
	public Page<Product> getProductsAdvanced(String kw, Long categoryId, String brand, Double minPower, Double maxPower,
			Double minHead, Double maxHead, int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		List<Long> categoryIds = getAllCategoryIds(categoryId);
		return productRepository.findWithFilters(kw, categoryIds, brand, minPower, maxPower, minHead, maxHead, pageable);
	}

	private List<Long> getAllCategoryIds(Long categoryId) {
		if (categoryId == null) return null;
		List<Long> ids = new ArrayList<>();
		categoryRepository.findById(categoryId).ifPresent(cat -> collectChildIds(cat, ids));
		return ids;
	}

	private void collectChildIds(Category category, List<Long> ids) {
		ids.add(category.getId());
		if (category.getChildren() != null) {
			for (Category child : category.getChildren()) {
				collectChildIds(child, ids);
			}
		}
	}
}

package com.pumpshop.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.pumpshop.entity.Product;
import com.pumpshop.service.ProductService;

@RestController
@RequestMapping("/api/v1/products")
@CrossOrigin("*")
public class ProductController {
	@Autowired
	private ProductService productService;

	@GetMapping
	public Page<Product> listAll(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "8") int size,
			@RequestParam(required = false) String kw) {
		return productService.getProducts(page, size, kw);
	}

	@GetMapping("/{id:.+}")
	public Product getOne(@PathVariable String id) {
		System.out.println("ID nhận được từ Controller: " + id);
		return productService.getProductById(id);
	}

	@PostMapping
	public Product create(@RequestBody Product product) {
		return productService.saveProduct(product);
	}
}

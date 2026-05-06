package com.pumpshop.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;
import com.pumpshop.entity.Review;

public interface ReviewService {
    List<Review> getReviewsByProduct(String productId);
    Review addReview(Review review, MultipartFile file);
}

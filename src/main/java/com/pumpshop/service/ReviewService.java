package com.pumpshop.service;

import java.util.List;

import com.pumpshop.entity.Review;

public interface ReviewService {
    List<Review> getReviewsByProduct(String productId);
    Review addReview(Review review);
}

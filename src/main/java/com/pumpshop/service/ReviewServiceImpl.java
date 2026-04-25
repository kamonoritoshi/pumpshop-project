package com.pumpshop.service;

import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;

import com.pumpshop.entity.Review;
import com.pumpshop.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;

    @Override
    public List<Review> getReviewsByProduct(String productId) {
        return reviewRepository.findByProductId(productId);
    }

    @Override
    public Review addReview(Review review) {
        review.setCreatedAt(new Date());
        return reviewRepository.save(review);
    }
}

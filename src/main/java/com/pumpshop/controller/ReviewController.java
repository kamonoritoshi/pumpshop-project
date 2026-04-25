package com.pumpshop.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pumpshop.entity.Review;
import com.pumpshop.entity.User;
import com.pumpshop.repository.UserRepository;
import com.pumpshop.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/reviews")
@CrossOrigin("*")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getReviewsByProduct(@PathVariable String productId) {
        System.out.println("Debug Controller: Reached GET Reviews for Product: " + productId);
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    @PostMapping
    public ResponseEntity<Review> addReview(
            @RequestBody Review review,
            @AuthenticationPrincipal UserDetails userDetails) {
        System.out.println("Debug Controller: Reached POST Add Review");
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        review.setUser(user);
        return ResponseEntity.ok(reviewService.addReview(review));
    }
}

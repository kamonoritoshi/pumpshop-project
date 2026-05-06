package com.pumpshop.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.pumpshop.entity.Review;
import com.pumpshop.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final String uploadDir = "uploads/reviews/";

    @Override
    public List<Review> getReviewsByProduct(String productId) {
        return reviewRepository.findByProductId(productId);
    }

    @Override
    public Review addReview(Review review, MultipartFile file) {
        review.setCreatedAt(new Date());

        if (file != null && !file.isEmpty()) {
            try {
                Path path = Paths.get(uploadDir);
                if (!Files.exists(path)) {
                    Files.createDirectories(path);
                }

                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = path.resolve(fileName);
                Files.copy(file.getInputStream(), filePath);

                review.setImage(fileName);
            } catch (IOException e) {
                throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
            }
        }

        return reviewRepository.save(review);
    }
}

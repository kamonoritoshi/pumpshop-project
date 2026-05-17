package com.pumpshop.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pumpshop.entity.Product;
import com.pumpshop.entity.User;
import com.pumpshop.entity.WishlistItem;
import com.pumpshop.repository.ProductRepository;
import com.pumpshop.repository.WishlistRepository;
import com.pumpshop.service.WishlistService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    @Override
    public List<WishlistItem> getWishlistByUser(User user) {
        return wishlistRepository.findByUserId(user.getId());
    }

    @Override
    @Transactional
    public WishlistItem addToWishlist(User user, String productId) {
        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            return wishlistRepository.findByUserIdAndProductId(user.getId(), productId).orElse(null);
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));

        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProduct(product);
        return wishlistRepository.save(item);
    }

    @Override
    @Transactional
    public void removeFromWishlist(User user, String productId) {
        wishlistRepository.findByUserIdAndProductId(user.getId(), productId)
                .ifPresent(wishlistRepository::delete);
    }
}

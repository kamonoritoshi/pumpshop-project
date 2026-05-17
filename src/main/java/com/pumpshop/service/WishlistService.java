package com.pumpshop.service;

import java.util.List;

import com.pumpshop.entity.User;
import com.pumpshop.entity.WishlistItem;

public interface WishlistService {
    List<WishlistItem> getWishlistByUser(User user);
    WishlistItem addToWishlist(User user, String productId);
    void removeFromWishlist(User user, String productId);
}

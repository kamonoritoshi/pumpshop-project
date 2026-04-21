package com.pumpshop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pumpshop.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    boolean existsByName(String name);
}

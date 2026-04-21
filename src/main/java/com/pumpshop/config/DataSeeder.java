package com.pumpshop.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.pumpshop.entity.Role;
import com.pumpshop.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        seedRole(1L, "ROLE_USER");
        seedRole(2L, "ROLE_ADMIN");
    }

    private void seedRole(Long id, String name) {
        if (!roleRepository.existsByName(name)) {
            Role role = new Role();
            role.setId(id);
            role.setName(name);
            roleRepository.save(role);
            System.out.println("Seeded role: " + name);
        }
    }
}

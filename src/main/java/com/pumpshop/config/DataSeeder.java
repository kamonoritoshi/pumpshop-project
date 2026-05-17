package com.pumpshop.config;

import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.pumpshop.entity.Role;
import com.pumpshop.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        fixByteaColumns();
        seedRole(1L, "ROLE_USER");
        seedRole(2L, "ROLE_ADMIN");
    }

    private void fixByteaColumns() {
        try {
            String[] columns = {"name", "brand", "description"};
            for (String col : columns) {
                // Query database metadata to see if the column type is 'bytea'
                List<String> dataTypes = jdbcTemplate.query(
                    "SELECT data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name = ?",
                    (rs, rowNum) -> rs.getString("data_type"),
                    col
                );
                
                if (!dataTypes.isEmpty() && "bytea".equalsIgnoreCase(dataTypes.get(0))) {
                    System.out.println(">>> [DataSeeder] Column '" + col + "' in table products is 'bytea'. Converting to VARCHAR/TEXT...");
                    String targetType = "description".equals(col) ? "TEXT" : "VARCHAR(255)";
                    String sql = "ALTER TABLE products ALTER COLUMN " + col + " TYPE " + targetType + 
                                 " USING convert_from(" + col + ", 'UTF8')";
                    jdbcTemplate.execute(sql);
                    System.out.println(">>> [DataSeeder] Successfully converted column '" + col + "' to " + targetType + "!");
                }
            }
        } catch (Exception e) {
            System.err.println(">>> [DataSeeder] Error while checking/fixing bytea columns: " + e.getMessage());
        }
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

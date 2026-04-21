package com.pumpshop.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

	@Id
    @Column(length = 50) 
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    private String image;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "suction_size")
    private String suctionSize;
    
    @Column(name = "discharge_size")
    private String dischargeSize;

    private String voltage;
    private Integer phase;
    private Integer frequency;

    @Column(name = "power_kw")
    private Double powerKw;
    
    @Column(name = "power_hp")
    private Double powerHp;

    @Column(name = "depth_max")
    private Double depthMax;

    @Column(name = "head_max")
    private Double headMax;

    @Column(name = "head_standard")
    private Double headStandard;

    @Column(name = "flow_max")
    private Double flowMax;

    @Column(name = "flow_standard")
    private Double flowStandard;

    @Column(name = "liquid_temp_max")
    private Double liquidTempMax;

    @Column(name = "material_body")
    private String materialBody;

    @Column(name = "material_impeller")
    private String materialImpeller;

    @Column(name = "protection_ip")
    private String protectionIp;

    @Column(name = "solid_passage")
    private Double solidPassage;

    private Double weight;
    private String brand;
    private Integer quantity;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
	
}

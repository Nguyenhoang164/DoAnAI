package com.example.aipa.model;

import org.hibernate.annotations.Collate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
//** Lớp thực thể đại diện cho user trong hệ thống */
@Entity
@Data
@Table(name = "aipa_users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String username;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(columnDefinition = "VARCHAR(60)")
    private String password;

    // **TRƯỜNG BẢO MẬT QUAN TRỌNG:**
    // Dữ liệu vector đặc trưng khuôn mặt (face embeddings) được lưu dưới dạng JSON
    // String.
    // Dữ liệu này được Python tính toán và gửi về.
    @Column(columnDefinition = "TEXT")
    private String faceEmbeddingsJson;
    // Thời gian đăng ký (timestamp)
    @Column(nullable = false)
    private Long registrationTimestamp = System.currentTimeMillis();
    // Trạng thái kích hoạt tài khoản
    @Column(nullable = true)
    private boolean isActive = true;
    // Vai trò của user (0 - user thường, 1 - admin)
    @Column(nullable = false)
    private int role = 0; // 0 - user thường, 1 - admin
    // Số lần đăng nhập thất bại liên tiếp
    @Column(nullable = false)
    private int numberOfLoginsFails = 0;
}

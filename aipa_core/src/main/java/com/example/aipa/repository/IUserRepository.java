package com.example.aipa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.aipa.model.User;

import java.util.List;
import java.util.Optional;

//** Lớp điều khiển user */
//** Cung cấp các phương thức truy xuất dữ liệu user từ cơ sở dữ liệu */
//** Sử dụng JPA Repository để thực hiện các thao tác CRUD */
//** Các phương thức tùy chỉnh để tìm kiếm user theo username, email, v.v. */
@Repository
public interface IUserRepository extends JpaRepository<User, Long> {
    // Tìm user theo username
    Optional<User> findByUsername(String username);

    // Tìm user theo email
    Optional<User> findByEmail(String email);

    // Lấy tất cả user
    List<User> findAll();

    // Xoá user theo ID
    void deleteById(Long id);

    // Xoá tất cả user
    void deleteAll();

    // Tìm thông tin user theo faceEmbeddingsJson
    Optional<User> findByFaceEmbeddingsJson(String faceEmbeddingsJson);

    // Cập nhật faceEmbeddingsJson cho user theo ID
    Optional<User> updateFaceEmbeddingsJsonById(Long id, String faceEmbeddingsJson);

    // Cập nhật thông tin user
    Optional<User> updateAndFlushOptional(User user);

    // Tạo mới user
    Optional<User> createUser(User user);


}

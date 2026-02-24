package com.example.aipa.service.impl;
import java.util.List;
import java.util.Optional;

import com.example.aipa.dto.FaceEmbeddingScore;
import com.example.aipa.model.User;
import com.example.aipa.repository.IUserRepository;

//** Lớp dịch vụ nội bộ để xử lý các thao tác liên quan đến user */
//** Kế thừa từ IUserRepository để sử dụng các phương thức truy xuất dữ liệu
//** Có thể mở rộng thêm các phương thức dịch vụ đặc thù cho user */
public interface InnerIUserService {
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
    Optional<User> updateUser(User user);
}

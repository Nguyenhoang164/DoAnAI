package com.example.aipa.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.CriteriaBuilder.In;

import com.example.aipa.repository.IUserRepository;
import com.example.aipa.service.impl.InnerIUserService;
import com.example.aipa.model.User;
import java.util.List;
import java.util.Optional;

//** Lớp dịch vụ để xử lý logic liên quan đến user */
//** Cung cấp các phương thức để đăng ký, đăng nhập, cập nhật thông tin
//** và các thao tác khác liên quan đến user */
@Service
public class UserService implements InnerIUserService {
    @Autowired
    private IUserRepository userRepository;
   
    // Tìm user theo username
    // 
    @Override
    public Optional<User> findByUsername(String username) {
        if(username == null || username.isEmpty()) {
            return Optional.empty();
        }
        return userRepository.findByUsername(username);
    }
    
    // Tìm user theo email
    @Override
    public Optional<User> findByEmail(String email) {
        if(email == null || email.isEmpty()) {
            return Optional.empty();
        }else if(!email.contains("@") && !email.contains(".")) {
            return Optional.empty();
        } else{
            return userRepository.findByEmail(email);
        }
    }
    // Lấy tất cả user
    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    // Xoá user theo ID
    @Override
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    // Xoá tất cả user
    @Override
    public void deleteAll() {
        userRepository.deleteAll();
    }

    // Tìm thông tin user theo faceEmbeddingsJson
    // Lấy thông tin user dựa trên dữ liệu vector đặc trưng khuôn mặt
    @Override
    public Optional<User> findByFaceEmbeddingsJson(String faceEmbeddingsJson) {
     Optional <User> userOpt = userRepository.findByFaceEmbeddingsJson(faceEmbeddingsJson);
      if (userOpt == null) {
        return Optional.empty();
      } else{
        return userOpt;
      }
    }
    // Cập nhật faceEmbeddingsJson cho user theo ID
    @Override
    public Optional<User> updateFaceEmbeddingsJsonById(Long id, String faceEmbeddingsJson) {
        if (id == null || id <= 0 || faceEmbeddingsJson == null || faceEmbeddingsJson.isEmpty()) {
            return Optional.empty();
        }
        return userRepository.updateFaceEmbeddingsJsonById(id, faceEmbeddingsJson);
    }
     
    // Cập nhật thông tin user
    @Override
    public Optional<User> updateUser(User user) {
        Optional<User> exitUserOpt = userRepository.findById(user.getId());
        if(user.getPassword() == exitUserOpt.get().getPassword()) {
            return Optional.empty();
        } else {
            return userRepository.updateAndFlushOptional(user);
        }
    }

    // Tạo mới user
    // cần thêm kiểm tra hợp lệ dữ liệu
    public Optional<User> RegisterUser(User user) {
        return userRepository.createUser(user);
    }

    // Đăng nhập user
    public Optional<User> LoginUser(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(user -> user.getPassword().equals(password));
    }             
}

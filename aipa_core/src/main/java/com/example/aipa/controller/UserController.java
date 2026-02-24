package com.example.aipa.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import com.example.aipa.service.UserService;

// ** Lớp điều khiển để xử lý các yêu cầu liên quan đến user */
// ** Cung cấp các endpoint để đăng ký, đăng nhập, cập nhật thông tin
// ** và các thao tác khác liên quan đến user */
@Controller
@RequestMapping("/users")
@CrossOrigin(value = "*")
public class UserController {
    @Autowired
    private UserService userService;

    
}
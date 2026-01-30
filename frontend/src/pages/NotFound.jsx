import React from "react";

const NotFound = () => {
  return (
    //flex, flex-col để sắp xếp phần tử con theo cột
    //items-center, justify-center để căn giữa cả ngang lẫn dọc
    //min-h-screen để chiều cao tối thiểu bằng chiều cao màn hình
    //text-center để căn giữa chữ
    //max-w-full để ảnh không vượt quá khung
    //mb-6 để chỉnh khoảng cách bên dưới
    //w-96 để xác định chiều rộng ảnh
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-slate-50">
        <img 
        src = "404_NotFound.png" 
        alt = "not found" 
        className = "max-w-full mb-6 w-96"
        />

        <p className = "text-xl font-semibold">
          Bạn đang đi vào vùng cấm địa 🚫
        </p> 

        <a href = "/" className = "inline-block px-6 py-3 mt-6 font-medium text-white transition shadow-md bg-primary rounded-2xl hover:bg-primary-dark">
          Quay về trang chủ 
        </a>
    </div>
  );
};

export default NotFound;
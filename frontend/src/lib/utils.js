import { clsx } from "clsx"; //thư viện giúp viết lớp có điều kiện
import { twMerge } from "tailwind-merge" 
//xử lý xung đột khi gộp nhiều class tailwinds (Ktra nếu có lớp xung đột sẽ tự bỏ đi)

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

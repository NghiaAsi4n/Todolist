import React, { useEffect, useState, useMemo } from "react"; // Thêm useMemo
import AddTask from "@/components/AddTask";
import DateTimeFilter from "@/components/DateTimeFilter";
import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import StatsAndFilters from "@/components/StatsAndFilters";
import TaskList from "@/components/TaskList";
import TaskListPagination from "@/components/TaskListPagination";
import { toast } from "sonner";
import api from "@/lib/axios";
import { visibleTaskLimit } from "@/lib/data";
import { useDebounce } from "@/hooks/useDebounce";

const HomePage = () => {
  //State: Quản lý giá trị người dùng gọi //Tạo state để lưu dữ liệu
  //Cần 1 state để lưu danh sách nhiệm vụ từ BE về
  //Thay vì gọi taskList -> Buffer là chỗ để gom dữ liệu lại sau đó mới xử lí tiếp
  //Dữ liệu thô cần chờ xử lý (chưa hiển thị giao diện cho ng dùng xem ngay)
  const [taskBuffer, setTaskBuffer] = useState([]);
  const [activeTaskCount, setActiveTaskCount] = useState(0);
  const [completeTaskCount, setCompleteTaskCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [dateQuery, setDateQuery] = useState("today");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(undefined);


  // Debounce search để tránh gọi API quá nhiều lần khi gõ
  const debouncedSearch = useDebounce(searchQuery, 700);

  //Logic

  const fetchTasks = React.useCallback(async () => {
    try {
      //Gọi api bằng axios với cả filter ngày và search và truyền vào URL của BE
      const res = await api.get(`/tasks?filter=${dateQuery}${debouncedSearch ? `&search=${debouncedSearch}` : ''}`);
      //Xem kết quả có gì
      setTaskBuffer(res.data.tasks);
      setActiveTaskCount(res.data.activeCount);
      setCompleteTaskCount(res.data.completeCount);
    } catch (error) {
      console.error("Lỗi xảy ra khi truy xuất tasks:", error);
      if (error?.response?.status === 401) {
        setTaskBuffer([]);
        setActiveTaskCount(0);
        setCompleteTaskCount(0);
        return;
      }
      toast.error("Lỗi xảy ra khi truy xuất tasks.");
    }
  }, [dateQuery, debouncedSearch]);

  //useEffect thường để theo dõi 1 hoặc nhiều state, mỗi khi state trong danh sách dependency thay đổi,
  //sẽ chạy lại logic bên trong. Trường hợp là mảng rỗng chỉ chạy 1 lần khi component render đầu tiên
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  //reset về trang 1 khi search thay đổi
  useEffect(() => {
    if (debouncedSearch !== undefined) setPage(1);
  }, [debouncedSearch]);

  //lắng nghe sự kiện đăng nhập/đăng xuất để load lại data
  useEffect(() => {
    const onAuthChanged = () => fetchTasks();
    window.addEventListener("auth-changed", onAuthChanged);
    return () => window.removeEventListener("auth-changed", onAuthChanged);
  }, [fetchTasks]);

  // Lọc task theo trạng thái (Active/Completed)
  // SỬA LỖI: Dùng useMemo để tránh tạo mảng mới mỗi lần render,
  // giúp useEffect bên dưới không bị chạy vô tận (cascading renders)
  const filteredTasks = useMemo(() => {
    return taskBuffer.filter((task) => {
      switch (filter) {
        case 'active':
          return task.status === 'active';
        case 'completed':
          return task.status === 'complete';
        default:
          return true;
      }
    });
  }, [taskBuffer, filter]);

  //Tự động lùi về trang trước nếu trang hiện tại bị rỗng (ví dụ xóa hết task ở trang cuối)
  useEffect(() => {
    const currentVisibleTasks = filteredTasks.slice(
      (page - 1) * visibleTaskLimit,
      page * visibleTaskLimit
    );
    if (page > 1 && currentVisibleTasks.length === 0 && filteredTasks.length > 0) {
      setPage((prev) => Math.max(prev - 1, 1));
    }
  }, [filteredTasks, page]);

  //Cắt mảng để hiển thị theo trang
  // Cũng nên dùng useMemo cho các biến tính toán này để tối ưu
  const visibleTasks = useMemo(() => {
    return filteredTasks.slice(
      (page - 1) * visibleTaskLimit,
      page * visibleTaskLimit
    );
  }, [filteredTasks, page]);

  //Tính tổng số trang: Tổng số lượng nhiệm vụ / số lượng nhiệm vụ trên 1 trang
  const totalPages = Math.ceil(filteredTasks.length / visibleTaskLimit) || 1;

  //Event handler
  const handleTaskChanged = () => {
    fetchTasks();
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1); // Reset trang khi đổi bộ lọc
  };

  const handleDateChange = (newDate) => {
    setDateQuery(newDate);
    setPage(1); // Reset trang khi đổi ngày
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen w-full bg-[#fefcff] dark:bg-black relative transition-colors duration-500 flex flex-col">

      {/* Bg cho Light mode */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-500 dark:opacity-0"
        style={{
          backgroundImage: `
          radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),
          radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
        }}
      />

      {/* Bg cho Dark mode */}
      <div
        className="absolute inset-0 z-0 opacity-0 transition-opacity duration-500 dark:opacity-100"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99, 102, 241, 0.25), transparent 70%), #000000",
        }}
      />

      {/* Main Content */}
      <div className="container pt-8 mx-auto relative z-10 flex-grow">
        <div className="w-full max-w-2xl p-6 mx-auto space-y-6">
          {/* Đầu trang */}
          <Header />

          {/* Tạo nhiệm vụ */}
          <AddTask
            handleNewTaskAdded={handleTaskChanged}
          />

          {/* Thống kê và bộ lọc */}
          <StatsAndFilters
            filter={filter}
            setFilter={handleFilterChange}
            activeTasksCount={activeTaskCount}
            completedTasksCount={completeTaskCount}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Danh sách nhiệm vụ */}
          <TaskList
            filteredTasks={visibleTasks}
            filter={filter}
            handleTaskChanged={handleTaskChanged}
          />

          {/* Phân trang và lọc theo ngày */}
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <TaskListPagination
              handleNext={handleNext}
              handlePrev={handlePrev}
              handlePageChange={handlePageChange}
              page={page}
              totalPages={totalPages}
            />
            <DateTimeFilter
              dateQuery={dateQuery}
              setDateQuery={handleDateChange}
            />
          </div>

          {/* Chân trang */}
          <Footer
            activeTasksCount={activeTaskCount}
            completedTasksCount={completeTaskCount}
          />
        </div>
      </div>

      {/* Copyright - Luôn ở cuối trang */}
      <div className="relative z-10 text-center py-6 mt-auto">
        <div className="flex flex-col items-center gap-3">
          {/* Contact Info */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {/* Email */}
            <a
              href="mailto:dev.trantrongnghia@gmail.com"
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              dev.trantrongnghia@gmail.com
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/NghiaAsi4n"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              NghiaAsi4n
            </a>
          </div>

          {/* Copyright Text */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2026 Tran Trong Nghia. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
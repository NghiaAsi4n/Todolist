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
    <div className="min-h-screen w-full bg-[#fefcff] dark:bg-black relative transition-colors duration-500">

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

      {/* Your components */}
      <div className="container pt-8 mx-auto relative z-10">
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
    </div>
  );
};

export default HomePage;
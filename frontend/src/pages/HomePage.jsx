import AddTask from "@/components/AddTask";
import DateTimeFilter from "@/components/DateTimeFilter";
import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import StatsAndFilters from "@/components/StatsAndFilters";
import TaskList from "@/components/TaskList";
import TaskListPagination from "@/components/TaskListPagination";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { visibleTaskLimit } from "@/lib/data";


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

  //Logic
 
  //useEffect thường để theo dõi 1 hoặc nhiều state, mỗi khi state trong danh sách dependency thay đổi,
  //sẽ chạy lại logic bên trong. Trường hợp là mảng rỗng chỉ chạy 1 lần khi component render đầu tiên
  useEffect(() => {
    fetchTasks();
  }, [dateQuery]);

  useEffect(() => {
    setPage(1);
  }, [filter, dateQuery]);


  const fetchTasks = async () => {
    try{
      //Gọi api bằng axios và truyền vào URL của BE
      const res = await api.get(`/tasks?filter=${dateQuery}`);
      //Xem kết quả có gì
      setTaskBuffer(res.data.tasks);
      setActiveTaskCount(res.data.activeCount);
      setCompleteTaskCount(res.data.completeCount);
    } catch (error){
      console.error("Lỗi xảy ra khi truy xuất tasks:", error);
      toast.error("Lỗi xảy ra khi truy xuất tasks.");
    }
  };
  
  //Gọi lại fetchTasks để hiển thị đúng số liệu
  const handleTaskChanged = () => {
    fetchTasks();
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

  //Biến
  //Lưu danh sách nhiệm vụ đã lọc
  const filteredTasks = taskBuffer.filter((task) => {
    switch(filter){
      case 'active': 
        return task.status === 'active';
      case 'completed':
        return task.status === 'complete';
      default:
        return true;
    }
  });

  //Hàm slice dùng để cắt từ mảng từ vị trí bắt đầu đến trước vị trí kết thúc
  const visibleTasks = filteredTasks.slice(
    (page - 1) * visibleTaskLimit, //page = 1 --> giá trị: 4
    page * visibleTaskLimit
  );

  //Nếu hết nhiệm vụ trên trang hiện tại sẽ quay về trang 1 thay vì hiển thị ko còn nhiệm vụ nào
  if (visibleTasks.length === 0) {
    handlePrev();
  }

  //Tính tổng số trang: Tổng số lượng nhiệm vụ / số lượng nhiệm vụ trên 1 trang
  const totalPages = Math.ceil(filteredTasks.length / visibleTaskLimit);
  
  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Dual Gradient Overlay Swapped Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
            radial-gradient(circle 500px at 20% 20%, rgba(139,92,246,0.3), transparent),
            radial-gradient(circle 500px at 80% 80%, rgba(59,130,246,0.3), transparent)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />
        {/* Components */}
        <div className="container pt-8 mx-auto relative z-10">
          <div className="w-full max-w-2xl p-6 mx-auto space-y-6">
            {/* Đầu trang */}
            <Header />

            {/* Tạo nhiệm vụ */}
            <AddTask 
              handleNewTaskAdded = {handleTaskChanged}
            />

            {/* Thống kê và bộ lọc */}
            <StatsAndFilters
              //Thêm props
              filter = {filter}
              setFilter = {setFilter}
              activeTasksCount={activeTaskCount}
              completedTasksCount={completeTaskCount}
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
                setDateQuery={setDateQuery}
              />
            </div>

            {/* Chân trang */}
            <Footer 
              activeTasksCount = {activeTaskCount}
              completedTasksCount = {completeTaskCount}
            />
              
          </div>
        </div>
    </div>
  );
};

export default HomePage;
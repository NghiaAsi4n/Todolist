import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const TaskListPagination = ({
    handleNext,
    handlePrev,
    handlePageChange,
    page,
    totalPages,
}) => {


const generatePages = () => {
    const pages = [];

    if (totalPages < 4) {
      //Hiện toàn bộ trang
      for (let i = 1; i <= totalPages; i++) {
        //Lặp mỗi lần lặp thêm số trang vào mảng
        pages.push(i);
      }
    } else {
        if (page < 2) {
            pages.push(1, 2, 3, "...", totalPages);
        } else if (page >= totalPages - 1) {
            pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, "...", page, "...", totalPages);
        }
    }

    return pages;
};

const pagesToShow = generatePages();

return (
    <div className="flex justify-center mt-4">
        <Pagination>
            <PaginationContent>
            {/* Trước */}
            <PaginationItem>
                <PaginationPrevious
                //Nhấn nút sẽ ktra: có phải trang 1 ko ? Nếu đúng ko làm gì hết : Nếu ko sẽ gọi handlePrev
                onClick={page === 1 ? undefined : handlePrev}
                className= {cn (
                    "cursor-pointer transition-colors",
                        "text-muted-foreground hover:bg-primary/10 dark:hover:bg-primary/20",
                        "hover:text-foreground dark:hover:text-white", 
                        page === 1 && "pointer-events-none opacity-50"
                )}
                />
            </PaginationItem>
                
            {/* Dấu 3 chấm 
                Tính số trang để xem cần hiển thị những trang nào
                Duyệt qua hàm pagestoShow bằng hàm map, mỗi lần duyệt có 1 phần tử p và index
            */} 
            {pagesToShow.map((p, index) => ( 
                <PaginationItem key={index}>
                {p === "..." ? (
                    <PaginationEllipsis />
                ) : (
                    <PaginationLink
                        isActive={p === page}
                        onClick={() => {
                            if (p !== page) handlePageChange(p);
                        }}
                    className={cn(
                            "cursor-pointer transition-all duration-200 border-transparent",
                            p === page 
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-md shadow-primary/20 scale-105 font-bold"
                                : "text-muted-foreground hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-foreground dark:hover:text-white"
                    )}
                    >
                    {p}
                    </PaginationLink>
                )}
                </PaginationItem>
            ))}

            {/* Sau */}
            <PaginationItem>
                <PaginationNext
                onClick={page === totalPages ? undefined : handleNext}
                className={cn(
                    "cursor-pointer transition-colors", 
                    "text-muted-foreground hover:bg-primary/10 dark:hover:bg-primary/20",
                    "hover:text-foreground dark:hover:text-white",
                    page === totalPages && "pointer-events-none opacity-50"
                )}
                />
            </PaginationItem>
            </PaginationContent>
        </Pagination>
    </div>
  );
};

export default TaskListPagination;
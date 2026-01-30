import Task from "../models/Task.js";

export const getAllTasks = async (req, res) => {
    const { filter = "today" } = req.query;
    //lấy ngày hiện tại
    const now = new Date();
    let startDate;

    switch (filter) {
        case "today": {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        }
        case "week": {
            const mondayDate =
                now.getDate() - (now.getDay() - 1) - (now.getDay() === 0 ? 7 : 0);
            startDate = new Date(now.getFullYear(), now.getMonth(), mondayDate);
            break;
        }
        case "month": {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        }
        case "all":
            default: {
            startDate = null;
        }
    }

    const query = startDate ? { createdAt: { $gte: startDate } } : {};

    try{
        const result = await Task.aggregate([
            { $match : query },
            {
                //facet là 1 nhánh cho chạy nhiều pipeline song song và gom kết quả.
                //=> Chạy 3 nhiệm vụ: sắp xếp, đếm số nv active và nv hoàn thành.
                $facet: {
                    //pipeline đầu tiên đặt là task, mỗi pipeline trong nhánh có thể cần nhiều bước
                    //cần dùng 1 mảng để chứa danh sách các bước đó.
                    //Sắp xếp nhiệm vụ theo thời gian tạo, chỉ có 1 bước là bước sắp xếp
                    tasks: [{$sort: {createdAt: -1}}],
                    //pipeline có 2 bước: lọc nv có status là active và bước 2 là đếm số lượng sau khi lọc
                    //count đầu tiên là đếm, count thứ 2 là nói với mgdb trả về mảng có key là count
                    activeCount: [{$match: {status: "active"}}, {$count: "count"}],
                    completeCount: [{$match: {status: "complete"}}, {$count: "count"}],
                },
            },
        ]);
        //Lấy kết quả cần
        const tasks = result[0].tasks;
        const activeCount = result[0].activeCount[0]?. count || 0;
        const completeCount = result[0].completeCount[0]?. count || 0;
        //Tất cả kq từ 3 bước trên sẽ đc trả về chung trong 1 đối tượng. Server chỉ cần gửi 1 querry lên db 
        //Gửi dữ liệu về FE là 1 object có tasks, activeCount, completeCount
        res.status(200).json({tasks, activeCount, completeCount});
    } catch (error){
        console.error("loi khi goi getAllTasks", error);
        res.status(500).json({message: "loi he thong"});
    }
};

export const createTask = async (req, res) => {
    try{
        const {title} = req.body;
        const task = new Task({title});

        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (error){
        console.error("loi khi goi createTask", error);
        res.status(500).json({message: "loi he thong"});
    }
};

export const updateTask = async (req, res) => {
    try {
        const { title, status, completedAt } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
        {
            title,
            status,
            completedAt,
        },
        { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Nhiệm vụ không tồn tại" });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Lỗi khi gọi updateTask", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const deleteTask = async (req, res) => {
    try{
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if(!deletedTask) {
            return res.status(404).json({message: "nhiem vu khong ton tai"});
        }
        res.status(200).json(deletedTask);
    } catch (error) {
        console.error("loi khi goi deleteTask", error);
        res.status(500).json( {message: "Loi he thong"} );
    }
};

const Task = require("../models/Task");
const checkPermissions = require("../utils/utils");

const getTasks = async (req, res) => {
  try {
    const { status } = req.query;
    const { isSuperAdmin, isOrgAdmin, isOrgMember } = checkPermissions(
      req.user
    );

    const filter = {};

    if (status) {
      filter.status = status;
    }

    // Role-based task filtering
    if (isSuperAdmin) {
      // superadmin sees all tasks
      // no additional filter needed
    } else if (isOrgAdmin) {
      // org admin sees all tasks in their org
      filter.orgId = req.user.orgId;
    } else if (isOrgMember) {
      // member sees only their tasks
      filter.orgId = req.user.orgId;
      filter.assignedTo = req.user._id;
    }

    // Fetch tasks
    let tasks = await Task.find(filter).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    // Add completed todoChecklist count to each task
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task.todoChecklist.filter(
          (item) => item.completed
        ).length;
        return { ...task._doc, completedTodoCount: completedCount };
      })
    );

    // Status summary counts
    const allTasks = await Task.countDocuments(
      isSuperAdmin || isOrgAdmin ? {} : { assignedTo: req.user._id }
    );

    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: "Pending",
    });

    const inProgressTasks = await Task.countDocuments({
      ...filter,
      status: "In Progress",
    });

    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "Completed",
    });

    res.json({
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { isSuperAdmin, isOrgAdmin, isOrgMember } = checkPermissions(
      req.user
    );

    const filter = {
      _id: req.params.id,
    };

    // Role-based task filtering
    if (isSuperAdmin) {
      // superadmin sees all tasks
      // no additional filter needed
    } else if (isOrgAdmin) {
      // org admin sees all tasks in their org
      filter.orgId = req.user.orgId;
    } else if (isOrgMember) {
      // member sees only their tasks
      filter.orgId = req.user.orgId;
      filter.assignedTo = req.user._id;
    }

    const task = await Task.findOne(filter).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { isOrgAdmin } = checkPermissions(req.user);

    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
    } = req.body;

    if (!isOrgAdmin) {
      return res
        .status(400)
        .json({ message: "Failed to create task", error: error.message });
    }

    if (!Array.isArray(assignedTo)) {
      return res
        .status(400)
        .json({ message: "assignedTo must be an array of user IDs" });
    }

    if (
      !assignedTo.every((user) => String(user.orgId) === String(req.user.orgId))
    ) {
      return res
        .status(403)
        .json({ message: "Users must belong to the same organization." });
    }

    const assignedToIds = assignedTo?.map((user) => user.userId);

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo: assignedToIds,
      createdBy: req.user._id,
      attachments,
      todoChecklist,
      orgId: req.user.orgId,
    });

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateTask = async (req, res) => {
  const {
    title,
    description,
    priority,
    dueDate,
    assignedTo,
    attachments,
    todoChecklist,
    orgId,
  } = req.body;
  try {
    const { isSuperAdmin, isOrgAdmin, isOrgMember } = checkPermissions(
      req.user
    );

    const filter = {
      _id: req.params.id,
    };

    // Role-based task filtering
    if (isSuperAdmin) {
      // superadmin sees all tasks
      // no additional filter needed
    } else if (isOrgAdmin) {
      // org admin sees all tasks in their org
      filter.orgId = req.user.orgId;
    } else if (isOrgMember) {
      // member sees only their tasks
      filter.orgId = req.user.orgId;
      filter.assignedTo = req.user._id;
    }
    const task = await Task.findOne(filter);

    if (!task) return res.status(404).json({ message: "Task not found" });

    task.title = title || task.title;
    task.description = description || task.description;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.todoChecklist = todoChecklist || task.todoChecklist;
    task.attachments = attachments || task.attachments;
    task.orgId = orgId || task.orgId;

    if (assignedTo) {
      if (!Array.isArray(assignedTo)) {
        return res.status(400).json({ message: "assignedTo must be an array" });
      }

      if (
        !assignedTo.every(
          (user) => String(user.orgId) === String(req.user.orgId)
        )
      ) {
        return res
          .status(403)
          .json({ message: "Users must belong to the same organization." });
      }

      const assignedToIds = assignedTo?.map((user) => user.userId);

      task.assignedTo = assignedToIds;
    }

    const updatedTask = await task.save();

    res.json({ message: "Task updated successfully", updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: " Not authorized" });
    }

    task.status = status || task.status;

    if (task.status === "Completed") {
      task.todoChecklist.forEach((item) => (item.completed = true));
      task.progress = 100;
    }

    await task.save();
    res.json({ message: "Task status updated", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateTaskChecklist = async (req, res) => {
  const { todoChecklist } = req.body;
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!task.assignedTo.includes(req.user._id) && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update checklist" });
    }

    task.todoChecklist = todoChecklist; // Replace with updated checklist

    // Auto-update progress based on checklist completion
    const completedCount = task.todoChecklist.filter(
      (item) => item.completed
    ).length;
    const totalItems = task.todoChecklist.length;
    task.progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    // Auto-mark task as compelted if all items are checked
    if (task.progress === 100) {
      task.status = "Completed";
    } else if (task.progress > 0) {
      task.status = "In Progress";
    } else {
      task.status = "Pending";
    }

    await task.save();
    const updatedTask = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    res.json({ message: "Task checklist updated", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const { isSuperAdmin } = checkPermissions(req.user);

    // Base filter depending on role
    const filter = isSuperAdmin ? {} : { orgId: req.user.orgId };

    // Fetch statistics
    const totalTasks = await Task.countDocuments(filter);
    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: "Pending",
    });
    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "Completed",
    });
    const overdueTasks = await Task.countDocuments({
      ...filter,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    // Ensure all possible statuses are included
    const taskStatuses = ["Pending", "In Progress", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for response keys
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["All"] = totalTasks; // Add total count to taskDistribution

    // Ensure all priority levels are included
    const taskPriorities = ["Low", "Medium", "High"];
    const taskPriorityLevelsRaw = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // Fetch recent 10 tasks
    const recentTasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevels,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch statistics for user-specific tasks
    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Pending",
    });
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Completed",
    });
    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    // Ensure all possible statuses are included
    const taskStatuses = ["Pending", "In Progress", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for response keys
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["All"] = totalTasks; // Add total count to taskDistribution

    // Ensure all priority levels are included
    const taskPriorities = ["Low", "Medium", "High"];
    const taskPriorityLevelsRaw = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
        },
      },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // Fetch recent 10 tasks
    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevels,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
};

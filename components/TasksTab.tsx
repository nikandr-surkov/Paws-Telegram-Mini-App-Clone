// components/TasksTab.tsx

/**
 * This project was developed by Nikandr Surkov.
 * 
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import React from 'react'
import { toast } from 'sonner'

// Import your task icons
import TaskWallet from '@/icons/TaskWallet'
import TaskPaws from '@/icons/TaskPaws'
import TaskTwitter from '@/icons/TaskTwitter'
import TaskTelegram from '@/icons/TaskTelegram'
import TaskInvite from '@/icons/TaskInvite'
import PawsLogo from '@/icons/PawsLogo'

import { Task, UserTask, fetchTasks, fetchUserTasks, startTask, verifyGhostEmojiTask } from '@/lib/supabase'

// Component mapping for dynamic icon rendering
const IconComponents: { [key: string]: React.FC<{ className?: string }> } = {
    TaskWallet,
    TaskPaws,
    TaskTwitter,
    TaskTelegram,
    TaskInvite,
    PawsLogo,
}

const TasksTab = () => {
    const [tasks, setTasks] = useState<Task[]>([])
    const [userTasks, setUserTasks] = useState<UserTask[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [verifying, setVerifying] = useState<string | null>(null)

    // TODO: Replace with actual user ID from your auth system
    const userId = "test-user-id"

    useEffect(() => {
        const loadTasks = async () => {
            try {
                console.log('Loading tasks...');
                const [tasksData, userTasksData] = await Promise.all([
                    fetchTasks(),
                    fetchUserTasks(userId)
                ]);
                console.log('Tasks loaded:', tasksData);
                console.log('User tasks loaded:', userTasksData);
                setTasks(tasksData);
                setUserTasks(userTasksData);
            } catch (error) {
                console.error('Error loading tasks:', error);
                setTasks([]); // Set empty tasks on error
                setUserTasks([]); // Set empty user tasks on error
            } finally {
                setLoading(false);
            }
        };

        loadTasks();
    }, [userId]);

    const handleStartTask = async (taskId: string, taskTitle: string) => {
        try {
            if (taskTitle === 'Put 👻 in your name') {
                // Telegram kullanıcı adını al (bu kısmı kendi mantığınıza göre entegre edin)
                const telegramUsername = prompt('Please enter your Telegram username:');
                if (!telegramUsername) return;

                setVerifying(taskId);
                const result = await verifyGhostEmojiTask(userId, taskId, telegramUsername);
                
                if (result) {
                    toast.success('Task completed! Ghost emoji found in your name! 🎉');
                    // Görev listesini yenile
                    const userTasksData = await fetchUserTasks(userId);
                    setUserTasks(userTasksData);
                } else {
                    toast.error('Ghost emoji not found in your name. Please add 👻 to your name and try again.');
                }
            } else {
                const userTask = await startTask(userId, taskId);
                setUserTasks([...userTasks, userTask]);
            }
        } catch (error) {
            console.error('Error handling task:', error);
            toast.error('An error occurred while processing the task.');
        } finally {
            setVerifying(null);
        }
    }

    const getTaskStatus = (taskId: string) => {
        const userTask = userTasks.find(ut => ut.task_id === taskId)
        return userTask?.status || 'not_started'
    }

    const getButtonText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Completed'
            case 'pending':
                return 'In Progress'
            case 'failed':
                return 'Failed'
            default:
                return 'Start'
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>;
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full text-red-500">
                {error}
            </div>
        );
    }

    // Add debug output for tasks
    console.log('Rendering tasks:', tasks);

    return (
        <div className={`quests-tab-con px-4 transition-all duration-300`}>
            {/* Header */}
            <div className="pt-8">
                <h1 className="text-3xl font-bold mb-2">TASKS</h1>
                <div>
                    <span className="text-xl font-semibold">GET REWARDS </span>
                    <span className="text-xl text-gray-500">FOR</span>
                </div>
                <div className="text-xl text-gray-500">COMPLETING QUESTS</div>
            </div>

            {/* Tasks List */}
            <div className="mt-4 mb-20 bg-[#151516] rounded-xl">
                {tasks.map((task, index) => {
                    const status = getTaskStatus(task.id)
                    const buttonText = getButtonText(status)
                    const isCompleted = status === 'completed'
                    const isVerifying = verifying === task.id

                    return (
                        <div
                            key={task.id}
                            className="flex items-center"
                        >
                            <div className="w-[72px] flex justify-center">
                                <div className="w-10 h-10">
                                    {task.icon_type === 'image' ? (
                                        <Image
                                            src={task.icon_value}
                                            alt={task.title}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-contain"
                                            priority
                                        />
                                    ) : (
                                        task.icon_value in IconComponents && (
                                            React.createElement(IconComponents[task.icon_value], {
                                                className: "w-full h-full"
                                            })
                                        )
                                    )}
                                </div>
                            </div>
                            <div className={`flex items-center justify-between w-full py-4 pr-4 ${index !== 0 && "border-t border-[#222622]"}`}>
                                <div>
                                    <div className="text-[17px]">{task.title}</div>
                                    <div className="text-gray-400 text-[14px]">+ {task.reward_amount} {task.reward_currency}</div>
                                </div>
                                <button
                                    onClick={() => !isCompleted && !isVerifying && handleStartTask(task.id, task.title)}
                                    className={`h-8 px-4 rounded-full text-sm font-medium flex items-center ${
                                        isCompleted
                                            ? 'bg-green-500 text-white cursor-not-allowed'
                                            : isVerifying
                                            ? 'bg-yellow-500 text-white cursor-wait'
                                            : 'bg-white text-black hover:bg-gray-100'
                                    }`}
                                    disabled={isCompleted || isVerifying}
                                >
                                    {isVerifying ? 'Verifying...' : buttonText}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default TasksTab
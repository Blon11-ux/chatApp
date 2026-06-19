

"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const UserList = () => {
    const [users, setUsers] = useState([])
    const router = useRouter()

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch("/api/user/echiran")
            const jsonData = await response.json()
            setUsers(jsonData.users)
        }
        fetchUsers()
    }, [])

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">ユーザー一覧</h1>
                <div className="bg-white rounded-lg shadow">
                    {users.length === 0 ? (
                        <p className="text-center text-gray-500 p-8">ユーザーがいません</p>
                    ) : (
                        users.map((user) => (
                            <div key={user._id} className="flex items-center justify-between p-4 border-b last:border-0">
                                <div>
                                    <p className="font-bold text-gray-800">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <button
                    onClick={() => router.push("/")}
                    className="mt-4 text-blue-500 hover:underline font-bold"
                >
                    チャットに戻る
                </button>
            </div>
        </div>
    )
}

export default UserList
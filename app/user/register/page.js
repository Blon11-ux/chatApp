"use client"
import { useState } from "react"
import { useRouter } from "next/navigation" 

const page = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()
    
    const handleSubmit = async(e) => {
        e.preventDefault()
        try{
            const response = await fetch("/api/user/register", {
                method: "POST",
                headers:{
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }, 
                body: JSON.stringify({name, email, password})
            })
            const jsonData = await response.json()
            alert(jsonData.message)
            if(response.ok){
                router.push("/user/login")
            }
        }catch(err){
            console.error(err)
            alert("ユーザー登録失敗")
        }
    }
    return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
                <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">ユーザー登録</h1>
                <form onSubmit={handleSubmit}>
                <input className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 font-bold text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none " 
                    value={name} onChange={(e) => setName(e.target.value)}
                    type="text" 
                    name="name" 
                    placeholder="名前" required />
                <input
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 font-bold text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none mt-3" 
                    value={email} onChange={(e) => setEmail(e.target.value)} 
                    type="text" 
                    name="email" 
                    placeholder="メールアドレス" required />
                <input 
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 font-bold text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none mt-3" 
                    value={password} onChange={(e) => setPassword(e.target.value)} 
                    type="text"
                    name="password" 
                    placeholder="パスワード" required />
                <button 
                    type="submit"
                    className="w-full rounded-lg bg-blue-500 px-4 py-3 font-bold text-white hover:bg-blue-600 disabled:bg-gray-400 mt-4">
                    登録
                </button>
            </form>
            <button 
                type="submit"
                className="w-full rounded-lg bg-blue-500 px-4 py-3 font-bold text-white hover:bg-blue-600 disabled:bg-gray-400 mt-4">
                登録
            </button>

            </div>
        </div>
    )
}
export default page
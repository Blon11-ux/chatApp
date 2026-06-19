"use client"
import { useState } from "react"
import Link from "next/link" 
import {useRouter} from "next/navigation"

const Login = () => {
    const [email, setEmail] = useState("") 
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleSubmit = async(e) => {
        e.preventDefault()
        try{
            const response = await fetch("/api/user/login", {
                method: "POST",
                headers: { 
                    "Accept": "application/json", 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({email, password})
            })
            const jsonData = await response.json() 
            if (response.ok){
                localStorage.setItem("token", jsonData.token) 
                alert(jsonData.message)
                router.push("/")
            }else{
                alert(jsonData.message)
            }
        }catch{
            alert("ログイン失敗")
        }
    }
    
    return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-500 to-black-600">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border-2 border-gray-600">
                <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">ログイン</h1>
                    <form onSubmit={handleSubmit}>
                        <input 
                        className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 font-bold text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none " 
                        value={email} onChange={(e) => setEmail(e.target.value)} 
                        type="text" name="email" placeholder="メールアドレス" 
                        required/>
                        <input 
                        className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 font-bold text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none mt-3" 
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        name="password" 
                        placeholder="パスワード" required/>
                        <button 
                            className="w-full rounded-lg bg-blue-500 px-4 py-3 font-bold text-white hover:bg-blue-600 disabled:bg-gray-400 mt-4">ログイン
                        </button>
                        <p className="text-center text-sm text-gray-600 mt-4">
                            アカウントを持っていない場合は
                            <Link className="text-blue-500 hover:underline font-bold" href="/user/register">こちら</Link>
                            で作成してください
                            </p>
                    </form>
            </div>
        </div>
    )
}

export default Login
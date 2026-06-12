import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import connectDB from "../../../utils/database";
import { UserModel } from "../../../utils/schemaModels";

export async function POST(request) {
    const reqBody = await request.json()
    try{
        await connectDB();
        const savedUserData = await UserModel.findOne({email: reqBody.email});
        if(savedUserData){
            if(reqBody.password == savedUserData.password){
                const secretKey = new TextEncoder().encode("chat-app");
                const payload = {
                    email: reqBody.email,
                    name:savedUserData.name
                }
                const token = await new SignJWT(payload)
                                        .setProtectedHeader({alg :"HS256"})
                                        .setExpirationTime("1d")
                                        .sign(secretKey);
                return NextResponse.json({message:"ログイン成功", token: token});
            }else{
                return NextResponse.json({message:"ログイン失敗：パスワードが間違っています"})
            }
        }else{  
            return NextResponse.json({message:"ログイン失敗：ユーザー登録してください。"})
        }
    }catch{
        return NextResponse.json({message:"ログイン失敗"})
    }
}
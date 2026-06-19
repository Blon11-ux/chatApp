import { NextResponse} from "next/server"
import connectDB from "../../../utils/database"
import { UserModel } from "../../../utils/schemaModels"

export async function GET(){
    try{
        await connectDB();
        const users = await UserModel.find({},{password: 0});
        return NextResponse.json({users},{status:200});
    }catch{
        return NextResponse.json({message:"えら-"},{status:500})
    }
}
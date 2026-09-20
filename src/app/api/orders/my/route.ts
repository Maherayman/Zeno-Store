import { NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
export async function GET(){
 const session=await auth();
 if(!session?.user?.id)return NextResponse.json({error:"يجب تسجيل الدخول أولًا"},{status:401});
 const orders=await prisma.order.findMany({where:{userId:session.user.id},orderBy:{createdAt:"desc"},include:{items:true}});
 return NextResponse.json(orders);
}
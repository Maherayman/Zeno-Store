import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";

async function userId(){ const s=await auth(); return s?.user?.id ?? null; }
export async function GET(){const id=await userId();if(!id)return NextResponse.json({error:"Unauthorized"},{status:401});const cart=await prisma.cart.findUnique({where:{userId:id},include:{items:{include:{product:{include:{images:{orderBy:{sortOrder:"asc"}}}}}}});return NextResponse.json(cart??{items:[]});}
export async function PUT(req:NextRequest){const id=await userId();if(!id)return NextResponse.json({error:"Unauthorized"},{status:401});const b=await req.json();if(!Array.isArray(b.items))return NextResponse.json({error:"Invalid cart"},{status:400});const cart=await prisma.cart.upsert({where:{userId:id},create:{userId:id},update:{}});await prisma.cartItem.deleteMany({where:{cartId:cart.id}});for(const item of b.items){const p=await prisma.product.findFirst({where:{id:item.productId,isActive:true}});const q=Math.max(1,Math.min(Number(item.quantity)||1,p?.stock??0));if(p&&q>0)await prisma.cartItem.create({data:{cartId:cart.id,productId:p.id,quantity:q}})}return GET();}

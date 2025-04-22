import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

//get por id
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const {id} = params
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                memberships: true,
                routines: true,
                accessLogs: true,
            },
        });
        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error get id" }, { status: 500 });
    }}

//delete por id
export async function DELETE (req: Request, { params }: { params: { id: string } }) {
    try {
        const {id} = params
        const user = await prisma.user.delete({
            where: { id },
        });
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error borrando" }, { status: 500 });
    }}

//update por id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { email, password, role } = body;

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        email,
        role,
        ...(hashedPassword && { password: hashedPassword }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

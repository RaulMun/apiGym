import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Este crea un nuevo usuario
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role, fingerprintId } = body;

    // Validación
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role ?? "CLIENT", // Solo ADMIN o TRAINER podrían enviar otro rol
        fingerprintId,
      },
    });

    return NextResponse.json(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Error creando user" }, { status: 500 });
  }
}


// este es get many
export async function GET(_: Request) {
  try{
    const users = await prisma.user.findMany({
      include: {
        memberships: true,
        routines: true,
        accessLogs: true,
      },
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error get many" }, { status: 500 });
}}
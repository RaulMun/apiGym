import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Este endpoint espera: email, password, name, (opcional: fingerprintId), (opcional: role)
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
    console.error("Error creando usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

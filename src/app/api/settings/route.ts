import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.settings.findMany();
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    
    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Upsert all keys
    const promises = Object.entries(data).map(([key, value]) => {
      return prisma.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    });

    await Promise.all(promises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

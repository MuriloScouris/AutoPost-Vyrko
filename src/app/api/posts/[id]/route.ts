import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { caption, status, scheduledFor } = await request.json();

    if (caption === undefined && !status) {
      return NextResponse.json({ error: 'Nenhum dado para atualizar' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (caption !== undefined) dataToUpdate.caption = caption;
    if (status !== undefined) dataToUpdate.status = status;
    if (scheduledFor !== undefined) dataToUpdate.scheduledFor = scheduledFor;

    const updatedPost = await prisma.post.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.post.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir post:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir' }, { status: 500 });
  }
}

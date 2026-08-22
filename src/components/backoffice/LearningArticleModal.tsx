'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLearningArticleSchema, type CreateLearningArticleInput } from '@/lib/validation';
import { Modal, FormField, ModalActions, inputClass } from './Modal';
import { ArticleAttachments, type AttachmentData } from './ArticleAttachments';

export function LearningArticleModal({
  article,
  triggerLabel,
  triggerClassName,
}: {
  article?: { id: string; tag: string; title: string; body: string; attachments?: AttachmentData[] };
  triggerLabel: string;
  triggerClassName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateLearningArticleInput>({
    resolver: zodResolver(createLearningArticleSchema),
    defaultValues: article ?? { tag: '', title: '', body: '' },
  });

  function close() {
    setOpen(false);
    reset();
  }

  async function onSubmit(data: CreateLearningArticleInput) {
    const url = article ? `/api/learning-articles/${article.id}` : '/api/learning-articles';
    const res = await fetch(url, {
      method: article ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    close();
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>
      {open && (
        <Modal title={article ? 'แก้ไขบทความ' : 'เขียนบทความคลังความรู้ใหม่'} onClose={close}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5">
            <FormField label="หมวดหมู่" error={errors.tag?.message}>
              <input className={inputClass} placeholder="เช่น โภชนาการ" {...register('tag')} />
            </FormField>
            <FormField label="หัวข้อ" error={errors.title?.message}>
              <input className={inputClass} {...register('title')} />
            </FormField>
            <FormField label="เนื้อหา" error={errors.body?.message}>
              <textarea className={inputClass} rows={5} {...register('body')} />
            </FormField>
            <ModalActions onCancel={close} submitting={isSubmitting} />
          </form>
          {article && <ArticleAttachments articleId={article.id} attachments={article.attachments ?? []} />}
        </Modal>
      )}
    </>
  );
}

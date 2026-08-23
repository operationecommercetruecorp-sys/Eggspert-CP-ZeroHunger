'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLearningArticleSchema, type CreateLearningArticleInput } from '@/lib/validation';
import { Modal, FormField, ModalActions, inputClass } from './Modal';
import { ArticleAttachments, type AttachmentData } from './ArticleAttachments';
import { PendingAttachmentsPicker, type PendingAttachment } from './PendingAttachmentsPicker';

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
  const [pending, setPending] = useState<PendingAttachment[]>([]);
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
    setPending([]);
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

    if (!article && pending.length > 0) {
      const { article: created } = await res.json();
      for (const p of pending) {
        const form = new FormData();
        if (p.type === 'file' && p.file) form.append('file', p.file);
        else if (p.type === 'link' && p.url) form.append('linkUrl', p.url);
        else continue;
        await fetch(`/api/learning-articles/${created.id}/attachments`, { method: 'POST', body: form });
      }
    }

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
          {article ? (
            <ArticleAttachments articleId={article.id} attachments={article.attachments ?? []} />
          ) : (
            <PendingAttachmentsPicker pending={pending} onChange={setPending} />
          )}
        </Modal>
      )}
    </>
  );
}

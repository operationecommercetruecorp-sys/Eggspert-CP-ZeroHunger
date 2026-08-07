import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole, requireSchoolAccess } from '@/lib/rbac';
import { iotReadingSchema } from '@/lib/validation';

// No IoT hardware is deployed yet, so there's no device-authenticated ingestion endpoint —
// staff log readings by hand from this route instead (same pattern as egg/water logs).
export const POST = apiHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const actor = requireRole(await getSessionUser(), ['developer', 'admin', 'cp', 'teacher']);
  requireSchoolAccess(actor, params.id);
  const body = iotReadingSchema.parse(await req.json());

  const device = await prisma.iotDevice.findUnique({ where: { id: body.deviceId } });
  if (!device || device.schoolId !== params.id) {
    return NextResponse.json({ error: 'Device not found at this school' }, { status: 404 });
  }

  const reading = await prisma.iotReading.create({
    data: {
      deviceId: body.deviceId,
      temp: body.temp,
      humidity: body.humidity,
      water: body.water,
      feed: body.feed,
    },
  });
  return NextResponse.json({ reading }, { status: 201 });
});

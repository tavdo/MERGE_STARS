import { z } from 'zod';
// Transient form validation only: never an identity, registration or CORE record.
const name = z.string().trim().min(1, 'შეავსე ველი').max(120, 'მაქსიმუმ 120 სიმბოლო');
const phone = z.string().trim().regex(/^\+[1-9]\d{7,14}$/, 'საერთაშორისო ნომერი: + და 8–15 ციფრი');
export const personalPreparation = z.object({ first_name: name, last_name: name, email: z.string().trim().email('შეამოწმე ელფოსტა').max(254), phone, country: z.string().regex(/^[A-Z]{2}$/, 'ქვეყნის ორნიშნა კოდი'), region: name });
export const deliveryPreparation = z.object({ country: z.string().regex(/^[A-Z]{2}$/, 'ქვეყნის ორნიშნა კოდი'), region: z.string().trim().max(120), city: name, street: z.string().trim().min(1,'მისამართი აუცილებელია').max(240), building: name, apartment: z.string().trim().max(120), postal_code: z.string().trim().max(32), recipient_name: name, recipient_phone: phone, instructions: z.string().trim().max(500) });
export const registrationPurposes = [
  { id: 'BOTH', title: 'შევქმნა Brand Line და შევუკვეთო ნივთი' },
  { id: 'ORDER', title: 'შევუკვეთო პერსონალური პროდუქტი' },
  { id: 'CREATE', title: 'შევქმნა ჩემი Brand Line' },
  { id: 'ORGANIZATION', title: 'წარმოვადგენ ბრენდს ან კომპანიას' },
] as const;
export const purposePreparation = z.object({ purpose: z.enum(['BOTH','ORDER','CREATE','ORGANIZATION']), confirmed: z.literal(true, { errorMap: () => ({ message: 'დაადასტურე შენი არჩევანი' }) }) });

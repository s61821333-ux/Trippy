import { z } from 'zod'

const TimeString = z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM')

const Category = z.enum(['food', 'cafe', 'attraction', 'hotel', 'rest', 'transport', 'flight', 'other'])

export const AiSuggestionsBody = z.object({
  dayNumber: z.number().int().min(1).max(366),
  dayMeta: z.object({
    region: z.string().max(200),
    desc: z.string().max(500).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    emoji: z.string().max(10).optional(),
  }).optional(),
  existingEvents: z.array(z.object({
    id: z.string().max(100),
    time: TimeString,
    duration: z.number().int().min(5).max(1440),
    name: z.string().min(1).max(200),
    category: Category,
    location: z.string().max(300).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  })).max(100),
  tripName: z.string().min(1).max(100),
  countries: z.array(z.string().max(100)).max(20).optional(),
  exclude: z.array(z.string().max(200)).max(20).optional(),
  gapStart: z.number().int().min(0).max(1440).optional(),
  gapEnd: z.number().int().min(0).max(1440).optional(),
  locale: z.string().max(10).optional(),
})

export const CreateTripBody = z.object({
  name: z.string().min(1).max(100),
  days: z.number().int().min(1).max(365),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  theme: z.string().max(50).optional(),
  countries: z.array(z.string().max(100)).max(30).optional(),
  nickname: z.string().min(1).max(40).optional(),
  dayMetas: z.array(z.object({
    region: z.string().max(200),
    emoji: z.string().max(10).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    desc: z.string().max(500).optional(),
  })).max(365).optional(),
})

export const SendInvitationBody = z.object({
  tripId: z.string().uuid(),
  invitedEmail: z.string().email().max(254),
})

export const AcceptInvitationBody = z.object({
  invitationId: z.string().uuid(),
  initials: z.string().min(1).max(3).optional(),
})

export const UpdateTripBody = z.object({
  name: z.string().min(1).max(100).optional(),
  days: z.number().int().min(1).max(365).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  theme: z.string().max(50).optional(),
  countries: z.array(z.string().max(100)).max(30).optional(),
  trip_notes: z.string().max(5000).optional(),
  day_meta: z.array(z.object({
    day_index: z.number().int().min(0),
    region: z.string().max(200).optional(),
    emoji: z.string().max(10).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    description: z.string().max(500).optional(),
  })).optional(),
})

export const HotelsBody = z.object({
  hotels: z.array(z.object({
    id: z.string().max(100),
    name: z.string().max(200).optional(),
    location: z.string().max(300).optional(),
    checkInDay: z.number().int().min(1),
    checkOutDay: z.number().int().min(1),
    lat: z.number().optional(),
    lng: z.number().optional(),
  })).max(50),
})

export const AddExpenseBody = z.object({
  description: z.string().min(1).max(200),
  amount: z.number().positive().max(1_000_000),
  paidBy: z.string().min(1).max(100),
  splitCount: z.number().int().min(1).max(20),
})

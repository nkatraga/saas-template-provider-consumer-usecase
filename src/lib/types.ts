// [Template:Domain] — Domain type definitions. Replace with your vertical's entity types.

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "PROVIDER" | "CONSUMER" | "PARENT";
  providerId: string | null;
  consumerIds: string[];
}

export interface ProviderSettingsForm {
  showConsumerNames: boolean;
  showContactEmail: boolean;
  showContactPhone: boolean;
  requireProviderApproval: boolean;
  minAdvanceHours: number;
  maxAdvanceDays: number;
  allowCrossDayExchanges: boolean;
  allowDifferentDuration: boolean;
  reminderDayBefore: boolean;
  reminderHoursBefore: number;
  reminderEnabled: boolean;
  exchangeInstructions: string;
}

export interface BookingWithConsumer {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  consumer: {
    id: string;
    serviceType: string;
    bookingDuration: number;
    user: {
      name: string;
      email: string;
      phone: string | null;
      preferredContact: string;
    };
  };
}

export interface ExchangeCandidate {
  bookingId: string;
  startTime: string;
  endTime: string;
  consumerName?: string;
  contactEmail?: string;
  contactPhone?: string | null;
  preferredContact?: string;
  serviceType: string;
  duration: number;
}

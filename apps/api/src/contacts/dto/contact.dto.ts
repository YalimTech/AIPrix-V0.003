import { ContactStatus, ContactSource } from './create-contact.dto';

export class ContactDto {
  id: string;
  accountId: string;
  name: string;
  lastName?: string;
  phone: string;
  email?: string;
  company?: string;
  position?: string;
  status: ContactStatus;
  source: ContactSource;
  tags: string[];
  customFields?: Record<string, any>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  calls?: {
    id: string;
    status: string;
    duration?: number;
    success?: boolean;
    createdAt: Date;
  }[];
  contactLists?: {
    id: string;
    name: string;
    contactCount: number;
  }[];
}

export class ContactListDto {
  id: string;
  accountId: string;
  name: string;
  description?: string;
  contactCount: number;
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  contacts?: ContactDto[];
}

import { CreateContactDto } from './create-contact.dto';

export class ImportContactsDto {
  contactListId: string;
  contacts: CreateContactDto[];
  duplicateAction?: 'skip' | 'update' | 'create';
}

export class ContactStatsDto {
  totalContacts: number;
  activeContacts: number;
  inactiveContacts: number;
  blockedContacts: number;
  doNotCallContacts: number;
  contactsWithCalls: number;
  averageCallsPerContact: number;
}

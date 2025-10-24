import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import {
  ContactDto,
  ContactListDto,
  ContactStatsDto,
  ImportContactsDto,
} from './dto/contact.dto';
import {
  ContactSource,
  ContactStatus,
  CreateContactDto,
} from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createContactDto: CreateContactDto,
    accountId: string,
  ): Promise<ContactDto> {
    // Validar formato de número telefónico
    if (!this.isValidPhoneNumber(createContactDto.phone)) {
      throw new BadRequestException('Formato de número telefónico inválido');
    }

    // Verificar si ya existe un contacto con el mismo número
    const existingContact = await this.prisma.contact.findFirst({
      where: {
        phone: createContactDto.phone,
        accountId,
      },
    });

    if (existingContact) {
      throw new BadRequestException(
        'Ya existe un contacto con este número telefónico',
      );
    }

    const contact = await this.prisma.contact.create({
      data: {
        ...createContactDto,
        accountId,
      },
    });

    this.logger.log(
      `Contacto creado: ${contact.id} - ${contact.name} ${contact.lastName || ''}`,
    );
    this.eventEmitter.emit('contact.created', {
      contactId: contact.id,
      accountId,
    });

    return this.mapToDto(contact);
  }

  async findAll(
    accountId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: ContactStatus,
    tags?: string[],
  ): Promise<{ contacts: ContactDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: any = { accountId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          calls: {
            select: {
              id: true,
              status: true,
              duration: true,
              success: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          contactLists: {
            select: {
              contactList: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      contacts: contacts.map((contact) => this.mapToDto(contact)),
      total,
    };
  }

  async findOne(id: string, accountId: string): Promise<ContactDto> {
    const contact = await this.prisma.contact.findFirst({
      where: { id, accountId },
      include: {
        calls: {
          select: {
            id: true,
            status: true,
            duration: true,
            success: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        contactLists: {
          select: {
            contactList: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!contact) {
      throw new NotFoundException('Contacto no encontrado');
    }

    return this.mapToDto(contact);
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto,
    accountId: string,
  ): Promise<ContactDto> {
    const existingContact = await this.findOne(id, accountId);

    // Si se actualiza el número telefónico, verificar que no exista otro contacto con el mismo número
    if (
      updateContactDto.phone &&
      updateContactDto.phone !== existingContact.phone
    ) {
      if (!this.isValidPhoneNumber(updateContactDto.phone)) {
        throw new BadRequestException('Formato de número telefónico inválido');
      }

      const existingContactWithPhone = await this.prisma.contact.findFirst({
        where: {
          phone: updateContactDto.phone,
          accountId,
          id: { not: id },
        },
      });

      if (existingContactWithPhone) {
        throw new BadRequestException(
          'Ya existe otro contacto con este número telefónico',
        );
      }
    }

    const contact = await this.prisma.contact.update({
      where: { id },
      data: updateContactDto,
      include: {
        calls: {
          select: {
            id: true,
            status: true,
            duration: true,
            success: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        contactLists: {
          select: {
            contactList: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(
      `Contacto actualizado: ${contact.id} - ${contact.name} ${contact.lastName || ''}`,
    );
    this.eventEmitter.emit('contact.updated', {
      contactId: contact.id,
      accountId,
    });

    return this.mapToDto(contact);
  }

  async remove(id: string, accountId: string): Promise<void> {
    await this.findOne(id, accountId);

    // Verificar si el contacto tiene llamadas asociadas
    const callsCount = await this.prisma.call.count({
      where: { contactId: id, accountId },
    });

    if (callsCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar un contacto que tiene llamadas asociadas',
      );
    }

    await this.prisma.contact.delete({
      where: { id },
    });

    this.logger.log(`Contacto eliminado: ${id}`);
    this.eventEmitter.emit('contact.deleted', { contactId: id, accountId });
  }

  async importContacts(
    importData: ImportContactsDto,
    accountId: string,
  ): Promise<{ created: number; updated: number; errors: string[] }> {
    const { contactListId, contacts, duplicateAction = 'skip' } = importData;

    // Verificar que la lista de contactos existe
    const contactList = await this.prisma.contactList.findFirst({
      where: { id: contactListId, accountId },
    });

    if (!contactList) {
      throw new BadRequestException('Lista de contactos no encontrada');
    }

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const contactData of contacts) {
      try {
        // Validar número telefónico
        if (!this.isValidPhoneNumber(contactData.phone)) {
          errors.push(`Número telefónico inválido: ${contactData.phone}`);
          continue;
        }

        // Buscar contacto existente
        const existingContact = await this.prisma.contact.findFirst({
          where: {
            phone: contactData.phone,
            accountId,
          },
        });

        if (existingContact) {
          if (duplicateAction === 'update') {
            await this.prisma.contact.update({
              where: { id: existingContact.id },
              data: contactData,
            });
            updated++;
          } else if (duplicateAction === 'skip') {
            continue;
          }
        } else {
          // Crear nuevo contacto
          const contact = await this.prisma.contact.create({
            data: {
              ...contactData,
              accountId,
              source: ContactSource.IMPORT,
            },
          });

          // Agregar a la lista de contactos
          await this.prisma.contactListContact.create({
            data: {
              contactListId,
              contactId: contact.id,
            },
          });

          created++;
        }
      } catch (error) {
        errors.push(
          `Error procesando contacto ${contactData.phone}: ${error.message}`,
        );
      }
    }

    // Actualizar contador de contactos en la lista
    // const contactCount = await this.prisma.contactListContact.count({
    //   where: { contactListId },
    // });

    await this.prisma.contactList.update({
      where: { id: contactListId },
      data: {},
    });

    this.logger.log(
      `Importación completada: ${created} creados, ${updated} actualizados, ${errors.length} errores`,
    );
    this.eventEmitter.emit('contacts.imported', {
      contactListId,
      accountId,
      created,
      updated,
      errors: errors.length,
    });

    return { created, updated, errors };
  }

  // Gestión de listas de contactos
  async createContactList(
    name: string,
    description: string,
    accountId: string,
  ): Promise<ContactListDto> {
    const contactList = await this.prisma.contactList.create({
      data: {
        name,
        description,
        accountId,
      },
    });

    this.logger.log(
      `Lista de contactos creada: ${contactList.id} - ${contactList.name}`,
    );
    this.eventEmitter.emit('contactList.created', {
      contactListId: contactList.id,
      accountId,
    });

    return this.mapContactListToDto(contactList);
  }

  async getContactLists(accountId: string): Promise<ContactListDto[]> {
    const contactLists = await this.prisma.contactList.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      include: {
        contacts: {
          select: {
            contact: {
              select: {
                id: true,
                name: true,
                lastName: true,
                phone: true,
                status: true,
              },
            },
          },
          take: 5,
        },
      },
    });

    return contactLists.map((list) => this.mapContactListToDto(list));
  }

  async addContactToList(
    contactId: string,
    contactListId: string,
    accountId: string,
  ): Promise<void> {
    // Verificar que ambos existen y pertenecen al account
    await this.findOne(contactId, accountId);

    const contactList = await this.prisma.contactList.findFirst({
      where: { id: contactListId, accountId },
    });

    if (!contactList) {
      throw new BadRequestException('Lista de contactos no encontrada');
    }

    // Verificar que no esté ya en la lista
    const existingRelation = await this.prisma.contactListContact.findFirst({
      where: { contactId, contactListId },
    });

    if (existingRelation) {
      throw new BadRequestException('El contacto ya está en esta lista');
    }

    await this.prisma.contactListContact.create({
      data: { contactId, contactListId },
    });

    // Actualizar contador
    // const contactCount = await this.prisma.contactListContact.count({
    //   where: { contactListId },
    // });

    await this.prisma.contactList.update({
      where: { id: contactListId },
      data: {},
    });

    this.logger.log(`Contacto ${contactId} agregado a lista ${contactListId}`);
  }

  async removeContactFromList(
    contactId: string,
    contactListId: string,
    _accountId: string,
  ): Promise<void> {
    await this.prisma.contactListContact.deleteMany({
      where: { contactId, contactListId },
    });

    // Actualizar contador
    // const contactCount = await this.prisma.contactListContact.count({
    //   where: { contactListId },
    // });

    await this.prisma.contactList.update({
      where: { id: contactListId },
      data: {},
    });

    this.logger.log(`Contacto ${contactId} removido de lista ${contactListId}`);
  }

  async getStats(accountId: string): Promise<ContactStatsDto> {
    const [
      totalContacts,
      activeContacts,
      inactiveContacts,
      blockedContacts,
      doNotCallContacts,
      contactsWithCalls,
      totalCalls,
    ] = await Promise.all([
      this.prisma.contact.count({ where: { accountId } }),
      this.prisma.contact.count({
        where: { accountId, status: ContactStatus.ACTIVE },
      }),
      this.prisma.contact.count({
        where: { accountId, status: ContactStatus.INACTIVE },
      }),
      this.prisma.contact.count({
        where: { accountId, status: ContactStatus.BLOCKED },
      }),
      this.prisma.contact.count({
        where: { accountId, status: ContactStatus.DO_NOT_CALL },
      }),
      this.prisma.contact.count({
        where: {
          accountId,
          calls: { some: {} },
        },
      }),
      this.prisma.call.count({
        where: { accountId },
      }),
    ]);

    const averageCallsPerContact =
      contactsWithCalls > 0 ? totalCalls / contactsWithCalls : 0;

    return {
      totalContacts,
      activeContacts,
      inactiveContacts,
      blockedContacts,
      doNotCallContacts,
      contactsWithCalls,
      averageCallsPerContact: Math.round(averageCallsPerContact * 100) / 100,
    };
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Validación básica de número telefónico internacional
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  private mapToDto(contact: any): ContactDto {
    return {
      id: contact.id,
      accountId: contact.accountId,
      name: contact.name,
      lastName: contact.lastName,
      phone: contact.phone,
      email: contact.email,
      company: contact.company,
      position: contact.position,
      status: contact.status,
      source: contact.source,
      tags: contact.tags,
      customFields: contact.customFields,
      notes: contact.notes,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      calls: contact.calls,
      contactLists:
        contact.contactLists?.map((cl: any) => cl.contactList) || [],
    };
  }

  private mapContactListToDto(contactList: any): ContactListDto {
    return {
      id: contactList.id,
      accountId: contactList.accountId,
      name: contactList.name,
      description: contactList.description,
      contactCount: contactList.contactCount,
      createdAt: contactList.createdAt,
      updatedAt: contactList.updatedAt,
      contacts:
        contactList.contacts?.map((c: any) => this.mapToDto(c.contact)) || [],
    };
  }

  async clearAllContacts(accountId: string) {
    try {
      this.logger.log(
        `Eliminando todos los contactos para la cuenta ${accountId}`,
      );

      // Primero eliminar las relaciones en ContactListContact
      await this.prisma.contactListContact.deleteMany({
        where: {
          contact: {
            accountId,
          },
        },
      });

      // Luego eliminar todos los contactos de la cuenta
      const result = await this.prisma.contact.deleteMany({
        where: {
          accountId,
        },
      });

      this.logger.log(
        `Se eliminaron ${result.count} contactos de la cuenta ${accountId}`,
      );

      return {
        success: true,
        message: `Se eliminaron ${result.count} contactos`,
        deletedCount: result.count,
      };
    } catch (error) {
      this.logger.error('Error eliminando contactos:', error);
      throw new BadRequestException('Error al eliminar contactos');
    }
  }

  async getContactsByList(listId: string, accountId: string) {
    try {
      // Verificar que la lista existe y pertenece a la cuenta
      const contactList = await this.prisma.contactList.findFirst({
        where: {
          id: listId,
          accountId,
        },
      });

      if (!contactList) {
        throw new NotFoundException('Lista de contactos no encontrada');
      }

      // Obtener contactos de la lista
      const contacts = await this.prisma.contactListContact.findMany({
        where: {
          contactListId: listId,
        },
        include: {
          contact: true,
        },
        orderBy: {
          contact: {
            createdAt: 'desc',
          },
        },
      });

      return contacts.map((item) => this.mapToDto(item.contact));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error obteniendo contactos por lista:', error);
      throw new BadRequestException('Error al obtener contactos de la lista');
    }
  }
}

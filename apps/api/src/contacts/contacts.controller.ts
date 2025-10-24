import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountGuard } from '../tenancy/account.guard';
import { ContactsService } from './contacts.service';
import { ImportContactsDto } from './dto/contact.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contacts')
@UseGuards(JwtAuthGuard, AccountGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@Body() createContactDto: CreateContactDto, @Request() req) {
    return this.contactsService.create(createContactDto, req.user.accountId);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('tags') tags?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const tagsArray = tags ? tags.split(',') : undefined;

    return this.contactsService.findAll(
      req.user.accountId,
      pageNum,
      limitNum,
      search,
      status as any,
      tagsArray,
    );
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.contactsService.getStats(req.user.accountId);
  }

  // Gestión de listas de contactos - DEBE ir antes de @Get(':id')
  @Get('lists')
  getContactLists(@Request() req) {
    return this.contactsService.getContactLists(req.user.accountId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.contactsService.findOne(id, req.user.accountId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
    @Request() req,
  ) {
    return this.contactsService.update(
      id,
      updateContactDto,
      req.user.accountId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.contactsService.remove(id, req.user.accountId);
  }

  @Post('import')
  importContacts(@Body() importData: ImportContactsDto, @Request() req) {
    return this.contactsService.importContacts(importData, req.user.accountId);
  }

  // Gestión de listas de contactos
  @Post('lists')
  createContactList(
    @Body() body: { name: string; description?: string },
    @Request() req,
  ) {
    return this.contactsService.createContactList(
      body.name,
      body.description,
      req.user.accountId,
    );
  }

  @Post('lists/:contactListId/contacts/:contactId')
  @HttpCode(HttpStatus.OK)
  addContactToList(
    @Param('contactListId') contactListId: string,
    @Param('contactId') contactId: string,
    @Request() req,
  ) {
    return this.contactsService.addContactToList(
      contactId,
      contactListId,
      req.user.accountId,
    );
  }

  @Delete('lists/:contactListId/contacts/:contactId')
  removeContactFromList(
    @Param('contactListId') contactListId: string,
    @Param('contactId') contactId: string,
    @Request() req,
  ) {
    return this.contactsService.removeContactFromList(
      contactId,
      contactListId,
      req.user.accountId,
    );
  }

  @Delete('clear-all')
  @HttpCode(HttpStatus.OK)
  clearAllContacts(@Request() req) {
    return this.contactsService.clearAllContacts(req.user.accountId);
  }

  @Get('lists/:listId/contacts')
  getContactsByList(@Param('listId') listId: string, @Request() req) {
    return this.contactsService.getContactsByList(listId, req.user.accountId);
  }
}

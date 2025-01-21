import { Controller, Get } from '@nestjs/common';
import { ALL_PROPERTIES } from '../constants/properties';

@Controller('properties')
export class PropertiesController {
  @Get()
  getProperties() {
    return {
      statusCode: 200,
      message: 'Properties retrieved successfully',
      data: ALL_PROPERTIES,
    };
  }
}

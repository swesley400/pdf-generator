import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  ROW = 'row',
  COLUMN = 'column',
}

export enum TextAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

export enum PdfOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

export enum PdfPageSize {
  A4 = 'a4',
  LETTER = 'letter',
  LEGAL = 'legal',
}

export class MarginDto {
  @IsNumber()
  left: number;

  @IsNumber()
  right: number;

  @IsNumber()
  bottom: number;

  @IsNumber()
  top: number;
}

export class ContentItemDto {
  @IsEnum(ContentType)
  type: ContentType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  font?: string;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsEnum(TextAlign)
  align?: TextAlign;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  lineGap?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentItemDto)
  childs?: ContentItemDto[];
}

export class HeaderFooterDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentItemDto)
  content: ContentItemDto[];
}

export class PdfDto {
  @IsObject()
  @ValidateNested()
  @Type(() => MarginDto)
  margins: MarginDto;

  @IsEnum(PdfOrientation)
  orientation: PdfOrientation;

  @IsEnum(PdfPageSize)
  page: PdfPageSize;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HeaderFooterDto)
  header?: HeaderFooterDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentItemDto)
  content: ContentItemDto[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HeaderFooterDto)
  footer?: HeaderFooterDto;
}

import { IsOptional, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ArchiveQueryDto {
  @ApiPropertyOptional({ example: 'Ross', description: 'Recherche par nom, motif' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsString()
  dateDebut?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsString()
  dateFin?: string;

  @ApiPropertyOptional({ example: '1', description: 'Page courante' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '20', description: 'Items par page: 10, 20, 25, 50' })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}

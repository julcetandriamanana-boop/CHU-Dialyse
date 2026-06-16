import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ArchiveActionDto {
  @ApiProperty({ example: 'Fin de protocole dialyse', description: 'Motif obligatoire' })
  @IsString()
  @IsNotEmpty()
  motif: string;

  @ApiProperty({ example: 'Dr. Andrianjato', description: 'Nom de la personne qui archive' })
  @IsString()
  @IsNotEmpty()
  archived_by: string;
}

export class RestoreActionDto {
  @ApiProperty({ example: 'Dr. Andrianjato', description: 'Nom de la personne qui restaure' })
  @IsString()
  @IsOptional()
  restored_by?: string;
}

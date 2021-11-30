import { VariationOption } from './variation.option.model';

export interface Variation {
  VariationId: number;
  CompanyId: string;
  Name: string;
  CompanyType: string;
  Description: string;
  CreateDate?: string;
  CreateUserId: string;
  ModifyDate?: string;
  ModifyUserId: string;
  StatusId: number;
  IsSelected?: boolean;
  Class?: string[];
  VariationsOptions?: VariationOption[];
}



import { SearchType } from '../enums/search-type.enum';

export interface NextPageTrigger {
  page: number;
  type: SearchType;
}

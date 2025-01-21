export class SidenavItem {
  name: string | undefined;
  icon?: string;
  routeOrFunction?: string | '';
  enabled?: boolean;
  position?: number;
  navigation?: boolean;
  pathMatchExact?: boolean;
  action?: any;
  badge?: string;
  badgeColor?: string;
  type?: 'item' | 'subheading';
  customClass?: string;
}

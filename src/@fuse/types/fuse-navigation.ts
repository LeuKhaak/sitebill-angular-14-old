export class FuseNavigationItem
{
  id = '';
  title = '';
  type: string =  'item' || 'group' || 'collapsable';
  translate = '';
  icon = '';
  hidden = false;
  url = '';
  classes = '';
  exactMatch = false;
  externalUrl = false;
  openInNewTab = false;
  function: any = () => {};
  badge: {[index: string]: string} = {
    title: '',
    translate: '',
    bg: '',
    fg: '',
  };
  children: FuseNavigationItem[] = [];
}

export interface FuseNavigation extends FuseNavigationItem
{
  children: FuseNavigationItem[];
}

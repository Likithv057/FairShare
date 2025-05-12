import React from 'react';
import Home from './Home';
import User from './User';
import ArrowLeft from './ArrowLeft';
import ArrowRight from './ArrowRight';
import ArrowUp from './ArrowUp';
import ArrowDown from './ArrowDown';
import Delete from './Delete';
import Edit from './Edit';
import Logout from './Logout';
import Mail from './Mail';
import Search from './Search';
import Send from './Share';
import Share from './Send';
import Lock from './Lock';
import UPI from './Upi';
import Points from './Points';
import Message from './Message';
import Add from './Add';
import TextIcon from './TextIcon';
import Menu from './Menu';
import Group from './Group';
import Expenses from './Expenses';
import Light from './Light';
import Dark from './Dark';
import Pie from './Pie';
import List from './List';
import { useTheme } from '@/context/ThemeContext';


const icons = {
  expenses: Expenses,
  message: Message,
  group: Group,
  points: Points,
  texticon: TextIcon,
  menu: Menu,
  home: Home,
  upi: UPI,
  user: User,
  arrowleft: ArrowLeft,
  arrowright: ArrowRight,
  arrowup: ArrowUp,
  arrowdown: ArrowDown,
  delete: Delete,
  edit: Edit,
  logout: Logout,
  mail: Mail,
  lock: Lock,
  list: List,
  search: Search,
  send: Send,
  pie:Pie,
  share: Share,
  add: Add,
  light: Light,
  dark: Dark,
};

const Icon = ({ name, ...props }: { name: keyof typeof icons; [key: string]: any }) => {
  const Iconcomponent = icons[name];
  const { theme } = useTheme();

  return (
    <Iconcomponent
      height={props.height || 24}
      width={props.width || 24}
      strokeWidth={props.strokeWidth || 2}
      color={props.color || theme.colors.text} 
      {...props}
    />
  );
};

export default Icon;
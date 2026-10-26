import { Platform } from 'react-native';

export const colors = {
  paper: '#F2EDE3',
  paperDeep: '#EAE2D4',
  card: '#FBF7EE',
  ink: '#302C27',
  inkSoft: '#625A50',
  muted: '#92887A',
  line: '#DDD3C3',
  vermilion: '#8E1B1F',
  vermilionSoft: '#F7E7E4',
  jade: '#47655A',
  jadeSoft: '#E8F0EA',
  gold: '#A57D3B',
  white: '#FFFFFF',
};

export const fonts = {
  title: Platform.select({ ios: 'Songti SC', android: 'serif', default: 'serif' }),
  body: Platform.select({ ios: 'Songti SC', android: 'serif', default: 'serif' }),
  sans: Platform.select({ ios: 'PingFang SC', android: 'sans-serif', default: 'sans-serif' }),
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
};

export const radius = {
  card: 18,
  button: 14,
  pill: 999,
};

export const shadow = {
  shadowColor: '#302C27',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.07,
  shadowRadius: 10,
  elevation: 2,
};

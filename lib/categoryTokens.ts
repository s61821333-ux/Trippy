import { Category } from './types';

export const CAT_GRADIENTS: Record<Category, string> = {
  food:       'linear-gradient(150deg, #FFAA78 0%, #E05530 55%, #B82C0A 100%)',
  cafe:       'linear-gradient(150deg, #F2CC72 0%, #C67A20 55%, #8A5010 100%)',
  attraction: 'linear-gradient(150deg, #62CCFA 0%, #1A8EDA 55%, #0858B0 100%)',
  hotel:      'linear-gradient(150deg, #DC9EF4 0%, #9042CA 55%, #601A9A 100%)',
  rest:       'linear-gradient(150deg, #72E09A 0%, #22A85A 55%, #0C6E38 100%)',
  transport:  'linear-gradient(150deg, #7CBAF2 0%, #3272CA 55%, #1045A0 100%)',
  flight:     'linear-gradient(150deg, #68AAEE 0%, #1252C2 55%, #062A7A 100%)',
  other:      'linear-gradient(150deg, #F2CA92 0%, #C07A42 55%, #885020 100%)',
};

export const CAT_GLOW: Record<Category, string> = {
  food:       '0 6px 22px rgba(224,85,48,0.44)',
  cafe:       '0 6px 22px rgba(155,100,16,0.38)',
  attraction: '0 6px 22px rgba(26,142,218,0.44)',
  hotel:      '0 6px 22px rgba(144,66,202,0.42)',
  rest:       '0 6px 22px rgba(34,168,90,0.42)',
  transport:  '0 6px 22px rgba(50,114,202,0.40)',
  flight:     '0 6px 22px rgba(18,82,194,0.48)',
  other:      '0 6px 22px rgba(140,80,32,0.32)',
};

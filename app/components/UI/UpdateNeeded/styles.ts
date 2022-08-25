/* eslint-disable import/prefer-default-export */
import { StyleSheet } from 'react-native';

export const createStyles = (colors: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 25,
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.overlay.default,
      ...StyleSheet.absoluteFillObject,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      marginVertical: 14,
    },
    description: {
      textAlign: 'center',
    },
    images: {
      alignItems: 'center',
    },
    actionButtonWrapper: {
      width: '100%',
    },
    actionButton: {
      marginVertical: 10,
    },
  });

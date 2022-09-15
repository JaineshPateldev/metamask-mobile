// Third party dependencies.
import React, { useCallback, useMemo } from 'react';
import { ImageSourcePropType, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// External dependencies.
import SheetActions from '../../../../component-library/components-temp/SheetActions';
import SheetHeader from '../../../../component-library/components/Sheet/SheetHeader';
import { strings } from '../../../../../locales/i18n';
import TagUrl from '../../../../component-library/components/Tags/TagUrl';
import { getHost } from '../../../../util/browser';
import { useStyles } from '../../../../component-library/hooks';

// Internal dependencies.
import { AccountPermissionsConnectedProps } from './AccountPermissionsConnected.types';
import styleSheet from './AccountPermissionsConnected.styles';
import PickerNetwork from '../../../../component-library/components/Pickers/PickerNetwork';
import Networks, {
  getDefaultNetworkByChainId,
} from '../../../../util/networks';
import PopularList from '../../../../util/networks/customNetworks';
import AccountSelectorList from '../../../../components/UI/AccountSelectorList';
import { toggleNetworkModal } from '../../../../actions/modals';

const AccountPermissionsConnected = ({
  route,
  openConnectMoreAccounts,
  openRevokePermissions,
  ensByAccountAddress,
  accounts,
  isLoading,
  selectedAddresses,
  onSwitchActiveAccount,
}: AccountPermissionsConnectedProps) => {
  const {
    hostInfo: {
      metadata: { origin },
    },
  } = route.params;
  const { styles } = useStyles(styleSheet, {});
  const dispatch = useDispatch();
  const networkProvider = useSelector(
    (state: any) => state.engine.backgroundState.NetworkController.provider,
  );

  /**
   * Get image url from favicon api.
   */
  const getFavicon: ImageSourcePropType = useMemo(() => {
    const iconUrl = `https://api.faviconkit.com/${getHost(origin)}/64`;
    return { uri: iconUrl };
  }, [origin]);

  /**
   * Get the current network name.
   *
   * @returns Current network name.
   */
  const getNetworkName = useCallback(() => {
    let name = '';
    if (networkProvider.nickname) {
      name = networkProvider.nickname;
    } else {
      const networkType: keyof typeof Networks = networkProvider.type;
      name = Networks?.[networkType]?.name || Networks.rpc.name;
    }
    return name;
  }, [networkProvider.nickname, networkProvider.type]);

  /**
   * Get image source for either default MetaMask networks or popular networks, which include networks such as Polygon, Binance, Avalanche, etc.
   * @returns A network image from a local resource or undefined
   */
  const getNetworkImageSource = useCallback(():
    | ImageSourcePropType
    | undefined => {
    const defaultNetwork: any = getDefaultNetworkByChainId(
      networkProvider.chainId,
    );
    if (defaultNetwork) {
      return defaultNetwork.imageSource;
    }
    const popularNetwork = PopularList.find(
      (network) => network.chainId === networkProvider.chainId,
    );
    if (popularNetwork) {
      return popularNetwork.rpcPrefs.imageSource;
    }
  }, [networkProvider.chainId]);

  const renderSheetAction = useCallback(
    () => (
      <View style={styles.sheetActionContainer}>
        <SheetActions
          actions={[
            {
              label: strings('accounts.connect_more_accounts'),
              onPress: openConnectMoreAccounts,
              disabled: isLoading,
            },
          ]}
        />
      </View>
    ),
    [openConnectMoreAccounts, isLoading],
  );

  return (
    <>
      <SheetHeader title={strings('accounts.connected_accounts_title')} />
      <View style={styles.body}>
        <TagUrl
          imageSource={getFavicon}
          label={origin}
          cta={{
            label: strings('accounts.permissions'),
            onPress: openRevokePermissions,
          }}
        />
        <PickerNetwork
          label={getNetworkName()}
          imageSource={getNetworkImageSource()}
          onPress={() => dispatch(toggleNetworkModal())}
          style={styles.networkPicker}
        />
      </View>
      <AccountSelectorList
        onSelectAccount={(address) => {
          onSwitchActiveAccount({ origin, address });
        }}
        accounts={accounts}
        ensByAccountAddress={ensByAccountAddress}
        isLoading={isLoading}
        selectedAddresses={selectedAddresses}
      />
      {renderSheetAction()}
    </>
  );
};

export default AccountPermissionsConnected;

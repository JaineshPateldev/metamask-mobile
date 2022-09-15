import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import Device from '../../../util/device';
import AvatarAccount, {
  AvatarAccountType,
} from '../../../component-library/components/Avatars/AvatarAccount';
import { AccountRightButtonProps } from './AccountRightButton.types';
import AvatarNetwork from '../../../component-library/components/Avatars/AvatarNetwork';
import Networks, { getDefaultNetworkByChainId } from '../../../util/networks';
import PopularList from '../../../util/networks/customNetworks';
import { toggleNetworkModal } from '../../../actions/modals';

const styles = StyleSheet.create({
  leftButton: {
    marginTop: 12,
    marginRight: Device.isAndroid() ? 7 : 16,
    marginLeft: Device.isAndroid() ? 7 : 0,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * UI PureComponent that renders on the top right of the navbar
 * showing an identicon for the selectedAddress
 */
const AccountRightButton = ({
  selectedAddress,
  onPress,
}: AccountRightButtonProps) => {
  const accountAvatarType = useSelector((state: any) =>
    state.settings.useBlockieIcon
      ? AvatarAccountType.Blockies
      : AvatarAccountType.JazzIcon,
  );
  /**
   * Current network
   */
  const networkProvider = useSelector(
    (state: any) => state.engine.backgroundState.NetworkController.provider,
  );
  const dispatch = useDispatch();
  const onPressButton = selectedAddress
    ? onPress
    : () => dispatch(toggleNetworkModal());

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

  return (
    <TouchableOpacity
      style={styles.leftButton}
      onPress={onPressButton}
      testID={'navbar-account-button'}
    >
      {Boolean(selectedAddress) ? (
        <AvatarAccount
          type={accountAvatarType}
          accountAddress={selectedAddress}
        />
      ) : (
        <AvatarNetwork
          name={getNetworkName()}
          imageSource={getNetworkImageSource()}
        />
      )}
    </TouchableOpacity>
  );
};

export default AccountRightButton;
